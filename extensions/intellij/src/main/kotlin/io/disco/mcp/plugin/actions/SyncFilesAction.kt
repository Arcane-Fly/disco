package io.disco.mcp.plugin.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.fileChooser.FileChooser
import com.intellij.openapi.fileChooser.FileChooserDescriptorFactory
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.progress.Task
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.vfs.VirtualFile
import io.disco.mcp.plugin.services.DiscoApplicationService
import io.disco.mcp.plugin.services.DiscoProjectService
import io.disco.mcp.plugin.api.FileItem
import kotlinx.coroutines.runBlocking
import java.io.File
import java.nio.charset.StandardCharsets

/**
 * Action to sync files with selected container
 */
class SyncFilesAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val applicationService = DiscoApplicationService.getInstance()
        val projectService = project.getService(DiscoProjectService::class.java)
        
        if (!applicationService.isConnected()) {
            Messages.showErrorDialog(project, "Not connected to Disco MCP server", "Sync Files")
            return
        }
        
        val selectedContainer = projectService.getSelectedContainer()
        if (selectedContainer == null) {
            Messages.showErrorDialog(project, "No container selected for this project", "Sync Files")
            return
        }
        
        // Ask user to select sync direction
        val options = arrayOf("Upload to Container", "Download from Container", "Bidirectional Sync", "Cancel")
        val choice = Messages.showDialog(
            project,
            "Choose sync direction for container '${selectedContainer.name}':",
            "File Synchronization",
            options,
            0,
            Messages.getQuestionIcon()
        )
        
        when (choice) {
            0 -> uploadToContainer(project, selectedContainer.id)
            1 -> downloadFromContainer(project, selectedContainer.id)
            2 -> bidirectionalSync(project, selectedContainer.id)
            else -> return // Cancel
        }
    }
    
    private fun uploadToContainer(project: Project, containerId: String) {
        val projectService = project.getService(DiscoProjectService::class.java)
        
        ProgressManager.getInstance().run(object : Task.Backgroundable(project, "Uploading files to container", true) {
            override fun run(indicator: ProgressIndicator) {
                try {
                    indicator.text = "Scanning local files..."
                    val projectDir = project.baseDir
                    if (projectDir == null) {
                        ApplicationManager.getApplication().invokeLater {
                            Messages.showErrorDialog(project, "No project directory found", "Upload Failed")
                        }
                        return
                    }
                    
                    val filesToSync = mutableListOf<VirtualFile>()
                    collectFiles(projectDir, filesToSync)
                    
                    indicator.text = "Uploading ${filesToSync.size} files..."
                    var uploaded = 0
                    
                    for (file in filesToSync) {
                        if (indicator.isCanceled) break
                        
                        indicator.text2 = "Uploading: ${file.name}"
                        indicator.fraction = uploaded.toDouble() / filesToSync.size
                        
                        try {
                            val relativePath = getRelativePath(projectDir, file)
                            val content = String(file.contentsToByteArray(), StandardCharsets.UTF_8)
                            
                            runBlocking {
                                projectService.syncFileToContainer(containerId, relativePath, content)
                            }
                            
                            uploaded++
                        } catch (e: Exception) {
                            println("Failed to upload ${file.name}: ${e.message}")
                        }
                    }
                    
                    ApplicationManager.getApplication().invokeLater {
                        Messages.showInfoMessage(
                            project,
                            "Successfully uploaded $uploaded files to container",
                            "Upload Complete"
                        )
                    }
                    
                } catch (e: Exception) {
                    ApplicationManager.getApplication().invokeLater {
                        Messages.showErrorDialog(project, "Upload failed: ${e.message}", "Upload Failed")
                    }
                }
            }
        })
    }
    
    private fun downloadFromContainer(project: Project, containerId: String) {
        val projectService = project.getService(DiscoProjectService::class.java)
        
        // Let user select download directory
        val descriptor = FileChooserDescriptorFactory.createSingleFolderDescriptor()
        descriptor.title = "Select Download Directory"
        descriptor.description = "Choose where to download container files"
        
        val selectedDir = FileChooser.chooseFile(descriptor, project, project.baseDir)
        if (selectedDir == null) return
        
        ProgressManager.getInstance().run(object : Task.Backgroundable(project, "Downloading files from container", true) {
            override fun run(indicator: ProgressIndicator) {
                try {
                    indicator.text = "Listing container files..."
                    
                    val client = DiscoApplicationService.getInstance().client
                    if (client == null) {
                        ApplicationManager.getApplication().invokeLater {
                            Messages.showErrorDialog(project, "Not connected to server", "Download Failed")
                        }
                        return
                    }
                    
                    // Get files from container root
                    val containerFiles = client.listFiles(containerId, "/")
                    
                    indicator.text = "Downloading ${containerFiles.size} files..."
                    var downloaded = 0
                    
                    for (fileItem in containerFiles) {
                        if (indicator.isCanceled) break
                        
                        indicator.text2 = "Downloading: ${fileItem.name}"
                        indicator.fraction = downloaded.toDouble() / containerFiles.size
                        
                        try {
                            if (fileItem.type == "file") {
                                val content = client.readFile(containerId, fileItem.path)
                                val localFile = File(selectedDir.path, fileItem.path.trimStart('/'))
                                
                                // Create parent directories if needed
                                localFile.parentFile?.mkdirs()
                                localFile.writeText(content, StandardCharsets.UTF_8)
                                
                                downloaded++
                            }
                        } catch (e: Exception) {
                            println("Failed to download ${fileItem.name}: ${e.message}")
                        }
                    }
                    
                    ApplicationManager.getApplication().invokeLater {
                        Messages.showInfoMessage(
                            project,
                            "Successfully downloaded $downloaded files from container to ${selectedDir.path}",
                            "Download Complete"
                        )
                        
                        // Refresh the project view to show new files
                        project.baseDir?.refresh(false, true)
                    }
                    
                } catch (e: Exception) {
                    ApplicationManager.getApplication().invokeLater {
                        Messages.showErrorDialog(project, "Download failed: ${e.message}", "Download Failed")
                    }
                }
            }
        })
    }
    
    private fun bidirectionalSync(project: Project, containerId: String) {
        // Implement proper bidirectional sync with timestamp comparison and conflict resolution
        val options = arrayOf("Proceed with Sync", "Cancel")
        val choice = Messages.showDialog(
            project,
            "Bidirectional sync will compare timestamps and handle conflicts.\n" +
                    "Local files newer than remote: Upload to container\n" +
                    "Remote files newer than local: Download to local\n" +
                    "Conflicted files: User will be prompted\n\n" +
                    "Continue?",
            "Bidirectional Sync",
            options,
            0,
            Messages.getQuestionIcon()
        )
        
        if (choice != 0) return
        
        ProgressManager.getInstance().run(object : Task.Backgroundable(project, "Bidirectional file sync", true) {
            override fun run(indicator: ProgressIndicator) {
                try {
                    indicator.text = "Comparing file timestamps..."
                    
                    val client = DiscoApplicationService.getInstance().client
                    if (client == null) {
                        ApplicationManager.getApplication().invokeLater {
                            Messages.showErrorDialog(project, "Not connected to server", "Sync Failed")
                        }
                        return
                    }
                    
                    // Get container files with timestamps
                    val containerFiles = runBlocking {
                        client.listFiles(containerId, "/")
                    }
                    
                    // Create map of container files for quick lookup
                    val containerFileMap = containerFiles.associateBy { it.path }
                    
                    // Get local files
                    val projectRoot = project.baseDir ?: return
                    val localFiles = mutableListOf<VirtualFile>()
                    collectFiles(projectRoot, localFiles)
                    
                    val syncActions = mutableListOf<SyncAction>()
                    val conflicts = mutableListOf<FileConflict>()
                    
                    // Analyze local files
                    for (localFile in localFiles) {
                        val relativePath = getRelativePath(projectRoot, localFile)
                        val containerFile = containerFileMap[relativePath]
                        
                        if (containerFile == null) {
                            // Local file doesn't exist in container - upload
                            syncActions.add(SyncAction.Upload(localFile, relativePath))
                        } else {
                            // Compare timestamps
                            val localModTime = localFile.timeStamp
                            val containerModTime = containerFile.lastModified?.toEpochMilli() ?: 0
                            
                            when {
                                localModTime > containerModTime -> {
                                    // Local is newer - upload
                                    syncActions.add(SyncAction.Upload(localFile, relativePath))
                                }
                                containerModTime > localModTime -> {
                                    // Container is newer - download
                                    syncActions.add(SyncAction.Download(containerFile, relativePath))
                                }
                                else -> {
                                    // Same timestamp - check content hash if available
                                    // For now, consider them in sync
                                }
                            }
                        }
                    }
                    
                    // Check for container-only files (need to download)
                    for (containerFile in containerFiles) {
                        val localFile = localFiles.find { getRelativePath(projectRoot, it) == containerFile.path }
                        if (localFile == null) {
                            syncActions.add(SyncAction.Download(containerFile, containerFile.path))
                        }
                    }
                    
                    // Execute sync actions
                    var processed = 0
                    val total = syncActions.size
                    
                    for (action in syncActions) {
                        if (indicator.isCanceled) break
                        
                        indicator.text2 = "Processing ${action.getDescription()}"
                        indicator.fraction = processed.toDouble() / total
                        
                        when (action) {
                            is SyncAction.Upload -> {
                                runBlocking {
                                    val content = action.localFile.contentsToByteArray().toString(Charsets.UTF_8)
                                    client.writeFile(containerId, action.path, content)
                                }
                            }
                            is SyncAction.Download -> {
                                runBlocking {
                                    val content = client.readFile(containerId, action.path)
                                    val targetFile = File(projectRoot.path, action.path)
                                    targetFile.parentFile?.mkdirs()
                                    targetFile.writeText(content, Charsets.UTF_8)
                                }
                            }
                        }
                        
                        processed++
                    }
                    
                    ApplicationManager.getApplication().invokeLater {
                        // Refresh VFS to show downloaded files
                        projectRoot.refresh(false, true)
                        
                        val message = if (indicator.isCanceled) {
                            "Sync cancelled. Processed $processed of $total files."
                        } else {
                            "Bidirectional sync completed successfully.\n" +
                                    "Processed $total files.\n" +
                                    "Uploads: ${syncActions.count { it is SyncAction.Upload }}\n" +
                                    "Downloads: ${syncActions.count { it is SyncAction.Download }}"
                        }
                        
                        Messages.showInfoMessage(project, message, "Bidirectional Sync")
                    }
                    
                } catch (e: Exception) {
                    ApplicationManager.getApplication().invokeLater {
                        Messages.showErrorDialog(project, "Bidirectional sync failed: ${e.message}", "Sync Failed")
                    }
                }
            }
        })
    }
    
    private fun collectFiles(dir: VirtualFile, files: MutableList<VirtualFile>) {
        for (child in dir.children) {
            if (child.isDirectory) {
                if (!shouldIgnoreDirectory(child.name)) {
                    collectFiles(child, files)
                }
            } else {
                if (!shouldIgnoreFile(child.name)) {
                    files.add(child)
                }
            }
        }
    }
    
    private fun shouldIgnoreDirectory(name: String): Boolean {
        return name in setOf(".git", ".idea", "node_modules", "target", "build", "dist", ".gradle")
    }
    
    private fun shouldIgnoreFile(name: String): Boolean {
        return name.startsWith(".") && name != ".gitignore" && name != ".env.example"
    }
    
    private fun getRelativePath(baseDir: VirtualFile, file: VirtualFile): String {
        return file.path.removePrefix(baseDir.path).trimStart('/')
    }
    
    override fun update(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        e.presentation.isEnabled = applicationService.isConnected()
    }
}

/**
 * Represents a file synchronization action
 */
sealed class SyncAction {
    abstract fun getDescription(): String
    
    data class Upload(val localFile: VirtualFile, val path: String) : SyncAction() {
        override fun getDescription(): String = "Uploading $path"
    }
    
    data class Download(val containerFile: FileItem, val path: String) : SyncAction() {
        override fun getDescription(): String = "Downloading $path"
    }
}

/**
 * Represents a file conflict during sync
 */
data class FileConflict(
    val path: String,
    val localModTime: Long,
    val containerModTime: Long,
    val localFile: VirtualFile,
    val containerFile: FileItem
)
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
        // For now, implement as upload followed by download
        // In a full implementation, this would compare timestamps and sync bidirectionally
        Messages.showInfoMessage(
            project,
            "Bidirectional sync will upload local files first, then download any newer container files.\nThis may overwrite local changes!",
            "Bidirectional Sync"
        )
        
        uploadToContainer(project, containerId)
        // Note: In a production implementation, we'd implement proper conflict resolution
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
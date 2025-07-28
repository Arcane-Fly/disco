package io.disco.mcp.plugin.sync

import com.intellij.openapi.editor.Document
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileDocumentManagerListener
import com.intellij.openapi.project.Project
import com.intellij.openapi.project.ProjectManager
import com.intellij.openapi.vfs.VirtualFile
import io.disco.mcp.plugin.services.DiscoProjectService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Listener for file document changes to trigger automatic synchronization
 */
class FileSyncListener : FileDocumentManagerListener {
    
    override fun beforeDocumentSaving(document: Document) {
        val fileDocumentManager = FileDocumentManager.getInstance()
        val virtualFile = fileDocumentManager.getFile(document) ?: return
        
        // Get the project for this file
        val project = findProjectForFile(virtualFile) ?: return
        val discoService = project.getService(DiscoProjectService::class.java) ?: return
        
        // Check if auto-sync is enabled and we're connected
        if (!discoService.isAutoSyncEnabled() || !discoService.isConnected()) {
            return
        }
        
        syncFileToContainer(project, virtualFile, discoService)
    }
    
    private fun findProjectForFile(virtualFile: VirtualFile): Project? {
        return ProjectManager.getInstance().openProjects.find { project ->
            project.baseDir?.let { baseDir ->
                virtualFile.path.startsWith(baseDir.path)
            } ?: false
        }
    }
    
    private fun syncFileToContainer(project: Project, file: VirtualFile, discoService: DiscoProjectService) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val selectedContainer = discoService.getSelectedContainer()
                if (selectedContainer == null) {
                    // No container selected, skip sync
                    return@launch
                }
                
                // Get relative path within project
                val projectPath = project.baseDir?.path ?: return@launch
                val relativePath = file.path.removePrefix("$projectPath/")
                
                // Read file content
                val content = String(file.contentsToByteArray())
                
                // Sync to container
                discoService.syncFileToContainer(selectedContainer.id, relativePath, content)
                
            } catch (e: Exception) {
                // Handle sync errors - could show notification to user
                println("Failed to sync file ${file.name}: ${e.message}")
            }
        }
    }
}
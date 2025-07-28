package io.disco.mcp.plugin.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import io.disco.mcp.plugin.services.DiscoApplicationService

/**
 * Action to sync files with selected container
 */
class SyncFilesAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        
        // TODO: Implement file synchronization
        // This would involve:
        // 1. Get selected container from context
        // 2. Compare local project files with container files
        // 3. Sync bidirectionally based on timestamps
        // 4. Show progress dialog during sync
        
        // For now, show a placeholder message
        javax.swing.JOptionPane.showMessageDialog(
            null,
            "File synchronization feature coming soon!",
            "Sync Files",
            javax.swing.JOptionPane.INFORMATION_MESSAGE
        )
    }
    
    override fun update(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        e.presentation.isEnabled = applicationService.isConnected()
    }
}
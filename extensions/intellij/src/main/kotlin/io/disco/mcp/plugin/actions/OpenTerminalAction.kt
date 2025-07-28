package io.disco.mcp.plugin.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import io.disco.mcp.plugin.services.DiscoApplicationService

/**
 * Action to open terminal for selected container
 */
class OpenTerminalAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        
        // TODO: Implement terminal integration
        // This would involve:
        // 1. Get selected container from context
        // 2. Create a new terminal tab in IDE
        // 3. Establish connection to container terminal
        // 4. Handle command execution and output streaming
        
        // For now, show a placeholder message
        javax.swing.JOptionPane.showMessageDialog(
            null,
            "Terminal integration feature coming soon!",
            "Open Terminal",
            javax.swing.JOptionPane.INFORMATION_MESSAGE
        )
    }
    
    override fun update(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        e.presentation.isEnabled = applicationService.isConnected()
    }
}
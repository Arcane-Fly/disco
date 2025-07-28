package io.disco.mcp.plugin.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.application.ApplicationManager
import io.disco.mcp.plugin.services.DiscoApplicationService
import javax.swing.JOptionPane

/**
 * Action to connect to Disco MCP server
 */
class ConnectAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        
        ApplicationManager.getApplication().executeOnPooledThread {
            try {
                applicationService.connect()
                // Connection successful - UI will be updated via listeners
            } catch (ex: Exception) {
                ApplicationManager.getApplication().invokeLater {
                    JOptionPane.showMessageDialog(
                        null,
                        "Failed to connect to Disco MCP server: ${ex.message}",
                        "Connection Error",
                        JOptionPane.ERROR_MESSAGE
                    )
                }
            }
        }
    }
    
    override fun update(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        e.presentation.isEnabled = !applicationService.isConnected() && 
                                   applicationService.getSettings().isValid()
    }
}
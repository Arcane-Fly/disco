package io.disco.mcp.plugin.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.application.ApplicationManager
import io.disco.mcp.plugin.services.DiscoApplicationService
import javax.swing.JOptionPane

/**
 * Action to create a new container
 */
class CreateContainerAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        
        val containerName = JOptionPane.showInputDialog(
            null,
            "Enter container name:",
            "Create New Container",
            JOptionPane.QUESTION_MESSAGE
        )
        
        if (!containerName.isNullOrBlank()) {
            ApplicationManager.getApplication().executeOnPooledThread {
                try {
                    applicationService.getClient().createContainer(containerName.trim())
                    // Container created successfully - UI will refresh via listeners
                } catch (ex: Exception) {
                    ApplicationManager.getApplication().invokeLater {
                        JOptionPane.showMessageDialog(
                            null,
                            "Failed to create container: ${ex.message}",
                            "Create Container Error",
                            JOptionPane.ERROR_MESSAGE
                        )
                    }
                }
            }
        }
    }
    
    override fun update(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        e.presentation.isEnabled = applicationService.isConnected()
    }
}
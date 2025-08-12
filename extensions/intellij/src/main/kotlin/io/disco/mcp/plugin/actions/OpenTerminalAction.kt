package io.disco.mcp.plugin.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.progress.Task
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowManager
import io.disco.mcp.plugin.services.DiscoApplicationService
import io.disco.mcp.plugin.services.DiscoProjectService
import kotlinx.coroutines.runBlocking

/**
 * Action to open terminal for selected container
 */
class OpenTerminalAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val applicationService = DiscoApplicationService.getInstance()
        val projectService = project.getService(DiscoProjectService::class.java)
        
        if (!applicationService.isConnected()) {
            Messages.showErrorDialog(project, "Not connected to Disco MCP server", "Open Terminal")
            return
        }
        
        val selectedContainer = projectService.getSelectedContainer()
        if (selectedContainer == null) {
            Messages.showErrorDialog(project, "No container selected for this project", "Open Terminal")
            return
        }
        
        openContainerTerminal(project, selectedContainer.id, selectedContainer.name)
    }
    
    private fun openContainerTerminal(project: Project, containerId: String, containerName: String) {
        val projectService = project.getService(DiscoProjectService::class.java)
        
        ProgressManager.getInstance().run(object : Task.Backgroundable(project, "Connecting to container terminal", false) {
            override fun run(indicator: ProgressIndicator) {
                try {
                    indicator.text = "Creating terminal session for container $containerName..."
                    
                    val terminalSession = runBlocking {
                        projectService.createTerminalSession(containerId, "IntelliJ Session")
                    }
                    
                    if (terminalSession != null) {
                        ApplicationManager.getApplication().invokeLater {
                            // Show success message and terminal info
                            val message = buildString {
                                append("Terminal session created successfully!\n\n")
                                append("Container: $containerName\n")
                                append("Session ID: ${terminalSession.sessionId}\n")
                                append("Working Directory: ${terminalSession.workingDirectory}\n\n")
                                append("Use the Terminal tool window or the 'disco' commands in any terminal:")
                                append("\n• disco exec $containerId <command>")
                                append("\n• disco connect $containerId") 
                                append("\n• disco list")
                            }
                            
                            Messages.showInfoMessage(project, message, "Terminal Connected")
                            
                            // Try to open the built-in terminal tool window
                            openTerminalToolWindow(project)
                        }
                    } else {
                        ApplicationManager.getApplication().invokeLater {
                            Messages.showErrorDialog(
                                project, 
                                "Failed to create terminal session for container $containerName", 
                                "Terminal Connection Failed"
                            )
                        }
                    }
                    
                } catch (e: Exception) {
                    ApplicationManager.getApplication().invokeLater {
                        Messages.showErrorDialog(
                            project,
                            "Failed to connect to container terminal: ${e.message}",
                            "Terminal Connection Failed"
                        )
                    }
                }
            }
        })
    }
    
    private fun openTerminalToolWindow(project: Project) {
        try {
            val toolWindowManager = ToolWindowManager.getInstance(project)
            val terminalToolWindow = toolWindowManager.getToolWindow("Terminal")
            
            if (terminalToolWindow != null) {
                terminalToolWindow.activate(null)
            } else {
                // If Terminal tool window is not available, show instructions
                Messages.showInfoMessage(
                    project,
                    "Terminal tool window not found. You can use disco commands in any terminal:\n\n" +
                    "• Open View > Tool Windows > Terminal\n" +
                    "• Use 'disco connect <container-id>' to connect to your container",
                    "Terminal Instructions"
                )
            }
        } catch (e: Exception) {
            // Fallback - just show instructions
            Messages.showInfoMessage(
                project,
                "Use disco commands in the Terminal tool window:\n\n" +
                "• disco connect <container-id> - Connect to container terminal\n" +
                "• disco exec <container-id> <command> - Execute command\n" +
                "• disco list - List available containers",
                "Terminal Instructions"
            )
        }
    }
    
    override fun update(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        e.presentation.isEnabled = applicationService.isConnected()
    }
}
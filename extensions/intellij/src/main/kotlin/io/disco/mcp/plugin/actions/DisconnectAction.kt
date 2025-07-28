package io.disco.mcp.plugin.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import io.disco.mcp.plugin.services.DiscoApplicationService

/**
 * Action to disconnect from Disco MCP server
 */
class DisconnectAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        applicationService.disconnect()
    }
    
    override fun update(e: AnActionEvent) {
        val applicationService = DiscoApplicationService.getInstance()
        e.presentation.isEnabled = applicationService.isConnected()
    }
}
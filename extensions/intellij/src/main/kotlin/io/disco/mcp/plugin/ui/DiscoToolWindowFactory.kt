package io.disco.mcp.plugin.ui

import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory

/**
 * Factory for creating the Disco MCP tool window
 */
class DiscoToolWindowFactory : ToolWindowFactory, DumbAware {
    
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val toolWindowContent = DiscoToolWindowContent(project)
        val content = ContentFactory.getInstance().createContent(
            toolWindowContent.component,
            "",
            false
        )
        toolWindow.contentManager.addContent(content)
    }
    
    override fun shouldBeAvailable(project: Project): Boolean {
        return true
    }
}
package io.disco.mcp.plugin.listeners

import com.intellij.openapi.project.Project
import com.intellij.openapi.project.ProjectManagerListener

/**
 * Listener for project lifecycle events
 */
class ProjectListener : ProjectManagerListener {
    
    override fun projectOpened(project: Project) {
        // Initialize project-specific components when project opens
        // This could include checking for existing container associations
    }
    
    override fun projectClosed(project: Project) {
        // Clean up project-specific resources when project closes
        // This could include saving container associations
    }
}
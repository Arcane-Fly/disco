package io.disco.mcp.plugin.services

import com.intellij.openapi.components.Service
import com.intellij.openapi.project.Project

/**
 * Project-level service for Disco MCP plugin
 * Manages project-specific state and operations
 */
@Service(Service.Level.PROJECT)
class DiscoProjectService(private val project: Project) {
    
    private var selectedContainerId: String? = null
    
    /**
     * Get the currently selected container ID for this project
     */
    fun getSelectedContainerId(): String? = selectedContainerId
    
    /**
     * Set the selected container ID for this project
     */
    fun setSelectedContainerId(containerId: String?) {
        this.selectedContainerId = containerId
    }
    
    /**
     * Check if a container is selected for this project
     */
    fun hasSelectedContainer(): Boolean = selectedContainerId != null
    
    companion object {
        fun getInstance(project: Project): DiscoProjectService {
            return project.getService(DiscoProjectService::class.java)
        }
    }
}
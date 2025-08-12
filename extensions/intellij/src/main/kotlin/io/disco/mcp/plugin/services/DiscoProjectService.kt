package io.disco.mcp.plugin.services

import com.intellij.openapi.components.Service
import com.intellij.openapi.project.Project
import io.disco.mcp.plugin.api.Container
import io.disco.mcp.plugin.api.DiscoMCPClient
import io.disco.mcp.plugin.api.CommandResult
import io.disco.mcp.plugin.api.TerminalSession
import io.disco.mcp.plugin.api.TerminalSessionInfo

/**
 * Project-level service for Disco MCP plugin
 * Manages project-specific state and operations
 */
@Service(Service.Level.PROJECT)
class DiscoProjectService(private val project: Project) {
    
    private var selectedContainer: Container? = null
    private var autoSyncEnabled: Boolean = true
    private var client: DiscoMCPClient? = null
    
    /**
     * Set the MCP client instance
     */
    fun setClient(client: DiscoMCPClient?) {
        this.client = client
    }
    
    /**
     * Check if connected to MCP server
     */
    fun isConnected(): Boolean = client?.isConnected() == true
    
    /**
     * Get the currently selected container for this project
     */
    fun getSelectedContainer(): Container? = selectedContainer
    
    /**
     * Set the selected container for this project
     */
    fun setSelectedContainer(container: Container?) {
        this.selectedContainer = container
    }
    
    /**
     * Get the currently selected container ID for this project
     */
    fun getSelectedContainerId(): String? = selectedContainer?.id
    
    /**
     * Set the selected container ID for this project
     */
    fun setSelectedContainerId(containerId: String?) {
        // Note: This simplified implementation just stores the ID
        // In a full implementation, we'd also store/retrieve the full Container object
        if (containerId != null) {
            selectedContainer = Container(
                id = containerId,
                name = "Container $containerId",
                status = "unknown",
                createdAt = ""
            )
        } else {
            selectedContainer = null
        }
    }
    
    /**
     * Check if a container is selected for this project
     */
    fun hasSelectedContainer(): Boolean = selectedContainer != null
    
    /**
     * Check if auto-sync is enabled
     */
    fun isAutoSyncEnabled(): Boolean = autoSyncEnabled
    
    /**
     * Enable or disable auto-sync
     */
    fun setAutoSyncEnabled(enabled: Boolean) {
        this.autoSyncEnabled = enabled
    }
    
    /**
     * Sync a file to the selected container
     */
    suspend fun syncFileToContainer(containerId: String, relativePath: String, content: String): Boolean {
        val mcpClient = client ?: return false
        
        return try {
            mcpClient.writeFile(containerId, relativePath, content)
        } catch (e: Exception) {
            // Log error - in a full implementation, we'd use proper logging
            println("Failed to sync file $relativePath to container $containerId: ${e.message}")
            false
        }
    }
    
    /**
     * Execute a command in a container
     */
    suspend fun executeCommand(containerId: String, command: String, workingDirectory: String? = null): CommandResult? {
        val mcpClient = client ?: return null
        
        return try {
            mcpClient.executeCommand(containerId, command, workingDirectory)
        } catch (e: Exception) {
            println("Failed to execute command '$command' in container $containerId: ${e.message}")
            null
        }
    }
    
    /**
     * Create a terminal session for a container
     */
    suspend fun createTerminalSession(containerId: String, sessionName: String? = null): TerminalSession? {
        val mcpClient = client ?: return null
        
        return try {
            mcpClient.createTerminalSession(containerId, sessionName)
        } catch (e: Exception) {
            println("Failed to create terminal session for container $containerId: ${e.message}")
            null
        }
    }
    
    /**
     * List containers from the MCP server
     */
    suspend fun listContainers(): List<Container> {
        val mcpClient = client ?: return emptyList()
        
        return try {
            mcpClient.listContainers()
        } catch (e: Exception) {
            println("Failed to list containers: ${e.message}")
            emptyList()
        }
    }
    
    /**
     * List active terminal sessions for a container
     */
    suspend fun listTerminalSessions(containerId: String): List<TerminalSessionInfo> {
        val mcpClient = client ?: return emptyList()
        
        return try {
            mcpClient.listTerminalSessions(containerId)
        } catch (e: Exception) {
            println("Failed to list terminal sessions for container $containerId: ${e.message}")
            emptyList()
        }
    }
    
    companion object {
        fun getInstance(project: Project): DiscoProjectService {
            return project.getService(DiscoProjectService::class.java)
        }
    }
}
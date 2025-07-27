package io.disco.mcp.plugin.services

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage
import io.disco.mcp.plugin.api.DiscoMCPClient
import io.disco.mcp.plugin.config.DiscoSettings

/**
 * Application-level service for Disco MCP plugin
 * Manages global state and client connections
 */
@State(
    name = "DiscoMCPApplicationService",
    storages = [Storage("discoMCP.xml")]
)
class DiscoApplicationService : PersistentStateComponent<DiscoSettings> {
    
    private var settings = DiscoSettings()
    private var client: DiscoMCPClient? = null
    
    companion object {
        fun getInstance(): DiscoApplicationService {
            return ApplicationManager.getApplication().getService(DiscoApplicationService::class.java)
        }
    }
    
    override fun getState(): DiscoSettings = settings
    
    override fun loadState(state: DiscoSettings) {
        this.settings = state
    }
    
    fun getSettings(): DiscoSettings = settings
    
    fun updateSettings(newSettings: DiscoSettings) {
        this.settings = newSettings
    }
    
    /**
     * Get or create MCP client instance
     */
    fun getClient(): DiscoMCPClient {
        if (client == null) {
            client = DiscoMCPClient(settings.serverUrl, settings.apiKey)
        }
        return client!!
    }
    
    /**
     * Check if connected to MCP server
     */
    fun isConnected(): Boolean {
        return client?.isConnected() ?: false
    }
    
    /**
     * Connect to MCP server
     */
    suspend fun connect(): Result<Unit> {
        return try {
            val mcpClient = getClient()
            mcpClient.connect()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Disconnect from MCP server
     */
    fun disconnect() {
        client?.disconnect()
        client = null
    }
    
    /**
     * Refresh client connection with updated settings
     */
    fun refreshClient() {
        disconnect()
        client = DiscoMCPClient(settings.serverUrl, settings.apiKey)
    }
}
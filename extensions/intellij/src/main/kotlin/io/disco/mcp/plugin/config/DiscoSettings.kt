package io.disco.mcp.plugin.config

/**
 * Persistent settings for Disco MCP plugin
 */
data class DiscoSettings(
    var serverUrl: String = "https://disco-mcp.up.railway.app",
    var apiKey: String = "",
    var autoSync: Boolean = false,
    var syncInterval: Int = 30,
    var enableNotifications: Boolean = true,
    var debugMode: Boolean = false
) {
    
    /**
     * Validate settings configuration
     */
    fun isValid(): Boolean {
        return serverUrl.isNotBlank() && apiKey.isNotBlank()
    }
    
    /**
     * Get sanitized server URL (no trailing slash)
     */
    fun getSanitizedServerUrl(): String {
        return serverUrl.trimEnd('/')
    }
    
    /**
     * Check if auto-sync is enabled and configured properly
     */
    fun isAutoSyncEnabled(): Boolean {
        return autoSync && syncInterval > 0
    }
}
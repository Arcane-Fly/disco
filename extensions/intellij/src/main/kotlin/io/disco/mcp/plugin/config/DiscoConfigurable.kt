package io.disco.mcp.plugin.config

import com.intellij.openapi.options.Configurable
import com.intellij.openapi.options.ConfigurationException
import io.disco.mcp.plugin.services.DiscoApplicationService
import javax.swing.JComponent

/**
 * Configurable for Disco MCP plugin settings
 */
class DiscoConfigurable : Configurable {
    
    private var settingsPanel: DiscoSettingsPanel? = null
    private val applicationService = DiscoApplicationService.getInstance()
    
    override fun getDisplayName(): String = "Disco MCP"
    
    override fun createComponent(): JComponent {
        if (settingsPanel == null) {
            settingsPanel = DiscoSettingsPanel()
        }
        return settingsPanel!!.panel
    }
    
    override fun isModified(): Boolean {
        val panel = settingsPanel ?: return false
        val currentSettings = applicationService.getSettings()
        
        return panel.serverUrl != currentSettings.serverUrl ||
               panel.apiKey != currentSettings.apiKey ||
               panel.autoSync != currentSettings.autoSync ||
               panel.syncInterval != currentSettings.syncInterval ||
               panel.enableNotifications != currentSettings.enableNotifications ||
               panel.debugMode != currentSettings.debugMode
    }
    
    override fun apply() {
        val panel = settingsPanel ?: return
        
        val newSettings = DiscoSettings(
            serverUrl = panel.serverUrl,
            apiKey = panel.apiKey,
            autoSync = panel.autoSync,
            syncInterval = panel.syncInterval,
            enableNotifications = panel.enableNotifications,
            debugMode = panel.debugMode
        )
        
        applicationService.updateSettings(newSettings)
        applicationService.refreshClient()
    }
    
    override fun reset() {
        val panel = settingsPanel ?: return
        val settings = applicationService.getSettings()
        
        panel.serverUrl = settings.serverUrl
        panel.apiKey = settings.apiKey
        panel.autoSync = settings.autoSync
        panel.syncInterval = settings.syncInterval
        panel.enableNotifications = settings.enableNotifications
        panel.debugMode = settings.debugMode
    }
    
    override fun disposeUIResources() {
        settingsPanel = null
    }
}
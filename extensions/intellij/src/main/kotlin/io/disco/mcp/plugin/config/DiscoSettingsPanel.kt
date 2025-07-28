package io.disco.mcp.plugin.config

import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBPasswordField
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.FormBuilder
import java.awt.BorderLayout
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JSpinner
import javax.swing.SpinnerNumberModel

/**
 * Settings panel for Disco MCP configuration
 */
class DiscoSettingsPanel {
    
    val panel: JPanel
    private val serverUrlField = JBTextField()
    private val apiKeyField = JBPasswordField()
    private val autoSyncCheckBox = JBCheckBox("Enable automatic file synchronization")
    private val syncIntervalSpinner = JSpinner(SpinnerNumberModel(30, 1, 3600, 1))
    private val enableNotificationsCheckBox = JBCheckBox("Enable notifications")
    private val debugModeCheckBox = JBCheckBox("Enable debug mode")
    
    init {
        panel = createPanel()
        reset()
    }
    
    private fun createPanel(): JPanel {
        val mainPanel = JPanel(BorderLayout())
        
        val formPanel = FormBuilder.createFormBuilder()
            .addLabeledComponent(JBLabel("Server URL:"), serverUrlField, 1, false)
            .addLabeledComponent(JBLabel("API Key:"), apiKeyField, 1, false)
            .addSeparator()
            .addComponent(autoSyncCheckBox, 1)
            .addLabeledComponent(JBLabel("Sync Interval (seconds):"), syncIntervalSpinner, 1, false)
            .addSeparator()
            .addComponent(enableNotificationsCheckBox, 1)
            .addComponent(debugModeCheckBox, 1)
            .addComponentFillVertically(JPanel(), 0)
            .panel
        
        mainPanel.add(formPanel, BorderLayout.CENTER)
        return mainPanel
    }
    
    private fun reset() {
        // Set default values
        serverUrlField.text = "https://disco-mcp.up.railway.app"
        apiKeyField.text = ""
        autoSyncCheckBox.isSelected = false
        syncIntervalSpinner.value = 30
        enableNotificationsCheckBox.isSelected = true
        debugModeCheckBox.isSelected = false
    }
    
    // Property getters and setters
    
    var serverUrl: String
        get() = serverUrlField.text.trim()
        set(value) { serverUrlField.text = value }
    
    var apiKey: String
        get() = String(apiKeyField.password)
        set(value) { apiKeyField.text = value }
    
    var autoSync: Boolean
        get() = autoSyncCheckBox.isSelected
        set(value) { autoSyncCheckBox.isSelected = value }
    
    var syncInterval: Int
        get() = syncIntervalSpinner.value as Int
        set(value) { syncIntervalSpinner.value = value }
    
    var enableNotifications: Boolean
        get() = enableNotificationsCheckBox.isSelected
        set(value) { enableNotificationsCheckBox.isSelected = value }
    
    var debugMode: Boolean
        get() = debugModeCheckBox.isSelected
        set(value) { debugModeCheckBox.isSelected = value }
}
package io.disco.mcp.plugin.ui

import com.intellij.icons.AllIcons
import com.intellij.openapi.actionSystem.*
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.project.Project
import com.intellij.ui.TreeUIHelper
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.treeStructure.Tree
import io.disco.mcp.plugin.api.Container
import io.disco.mcp.plugin.services.DiscoApplicationService
import java.awt.BorderLayout
import javax.swing.*
import javax.swing.tree.DefaultMutableTreeNode
import javax.swing.tree.DefaultTreeModel

/**
 * Main content panel for the Disco MCP tool window
 */
class DiscoToolWindowContent(private val project: Project) {
    
    val component: JComponent
    private val containerTree: Tree
    private val treeModel: DefaultTreeModel
    private val rootNode: DefaultMutableTreeNode
    private val applicationService = DiscoApplicationService.getInstance()
    private var refreshJob: Job? = null
    
    init {
        rootNode = DefaultMutableTreeNode("Containers")
        treeModel = DefaultTreeModel(rootNode)
        containerTree = Tree(treeModel).apply {
            isRootVisible = false
            showsRootHandles = true
        }
        
        TreeUIHelper.getInstance().installTreeSpeedSearch(containerTree)
        
        component = createMainPanel()
        refreshContainers()
    }
    
    private fun createMainPanel(): JComponent {
        val panel = JPanel(BorderLayout())
        
        // Create toolbar
        val toolbar = createToolbar()
        panel.add(toolbar.component, BorderLayout.NORTH)
        
        // Create tree scroll pane
        val scrollPane = JBScrollPane(containerTree)
        panel.add(scrollPane, BorderLayout.CENTER)
        
        return panel
    }
    
    private fun createToolbar(): ActionToolbar {
        val actionGroup = DefaultActionGroup().apply {
            add(ConnectAction())
            add(DisconnectAction())
            addSeparator()
            add(CreateContainerAction())
            add(RefreshAction())
            addSeparator()
            add(SettingsAction())
        }
        
        return ActionManager.getInstance().createActionToolbar(
            "DiscoMCP.Toolbar",
            actionGroup,
            true
        )
    }
    
    fun refreshContainers() {
        refreshJob?.cancel()
        refreshJob = ApplicationManager.getApplication().executeOnPooledThread {
            try {
                if (applicationService.isConnected()) {
                    val containers = applicationService.getClient().listContainers()
                    SwingUtilities.invokeLater {
                        updateContainerTree(containers)
                    }
                } else {
                    SwingUtilities.invokeLater {
                        clearContainerTree()
                    }
                }
            } catch (e: Exception) {
                SwingUtilities.invokeLater {
                    clearContainerTree()
                }
            }
        }
    }
    
    private fun updateContainerTree(containers: List<Container>) {
        rootNode.removeAllChildren()
        
        containers.forEach { container ->
            val containerNode = DefaultMutableTreeNode(ContainerTreeNode(container))
            rootNode.add(containerNode)
        }
        
        treeModel.reload()
        
        // Expand all nodes
        for (i in 0 until containerTree.rowCount) {
            containerTree.expandRow(i)
        }
    }
    
    private fun clearContainerTree() {
        rootNode.removeAllChildren()
        treeModel.reload()
    }
    
    // Action implementations
    
    private inner class ConnectAction : AnAction("Connect", "Connect to Disco MCP Server", AllIcons.Actions.Execute) {
        override fun actionPerformed(e: AnActionEvent) {
            ApplicationManager.getApplication().executeOnPooledThread {
                try {
                    applicationService.connect()
                    SwingUtilities.invokeLater {
                        refreshContainers()
                    }
                } catch (ex: Exception) {
                    SwingUtilities.invokeLater {
                        JOptionPane.showMessageDialog(
                            component,
                            "Failed to connect: ${ex.message}",
                            "Connection Error",
                            JOptionPane.ERROR_MESSAGE
                        )
                    }
                }
            }
        }
        
        override fun update(e: AnActionEvent) {
            e.presentation.isEnabled = !applicationService.isConnected()
        }
    }
    
    private inner class DisconnectAction : AnAction("Disconnect", "Disconnect from Server", AllIcons.Actions.Suspend) {
        override fun actionPerformed(e: AnActionEvent) {
            applicationService.disconnect()
            clearContainerTree()
        }
        
        override fun update(e: AnActionEvent) {
            e.presentation.isEnabled = applicationService.isConnected()
        }
    }
    
    private inner class CreateContainerAction : AnAction("Create Container", "Create New Container", AllIcons.General.Add) {
        override fun actionPerformed(e: AnActionEvent) {
            val name = JOptionPane.showInputDialog(
                component,
                "Enter container name:",
                "Create Container",
                JOptionPane.QUESTION_MESSAGE
            )
            
            if (!name.isNullOrBlank()) {
                ApplicationManager.getApplication().executeOnPooledThread {
                    try {
                        applicationService.getClient().createContainer(name)
                        SwingUtilities.invokeLater {
                            refreshContainers()
                        }
                    } catch (ex: Exception) {
                        SwingUtilities.invokeLater {
                            JOptionPane.showMessageDialog(
                                component,
                                "Failed to create container: ${ex.message}",
                                "Create Error",
                                JOptionPane.ERROR_MESSAGE
                            )
                        }
                    }
                }
            }
        }
        
        override fun update(e: AnActionEvent) {
            e.presentation.isEnabled = applicationService.isConnected()
        }
    }
    
    private inner class RefreshAction : AnAction("Refresh", "Refresh Container List", AllIcons.Actions.Refresh) {
        override fun actionPerformed(e: AnActionEvent) {
            refreshContainers()
        }
        
        override fun update(e: AnActionEvent) {
            e.presentation.isEnabled = applicationService.isConnected()
        }
    }
    
    private inner class SettingsAction : AnAction("Settings", "Open Disco MCP Settings", AllIcons.General.Settings) {
        override fun actionPerformed(e: AnActionEvent) {
            // TODO: Open settings dialog
        }
    }
}

/**
 * Tree node representation of a container
 */
data class ContainerTreeNode(val container: Container) {
    override fun toString(): String {
        val status = when (container.status.lowercase()) {
            "running" -> "🟢"
            "stopped" -> "🔴"
            "error" -> "🟡"
            else -> "⚫"
        }
        return "$status ${container.name} (${container.id.take(8)})"
    }
}
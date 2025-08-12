package io.disco.mcp.plugin.terminal

import com.intellij.openapi.project.Project
import com.intellij.openapi.components.service
import com.intellij.terminal.TerminalCustomCommandHandler
import com.intellij.openapi.ui.Messages
import io.disco.mcp.plugin.services.DiscoProjectService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Custom terminal command handler for Disco MCP containers
 * Handles commands like: disco exec <container-id> <command>
 */
class DiscoTerminalCommandHandler(private val project: Project) : TerminalCustomCommandHandler {
    
    companion object {
        private const val DISCO_COMMAND_PREFIX = "disco"
        private const val EXEC_SUBCOMMAND = "exec"
        private const val CONNECT_SUBCOMMAND = "connect"
        private const val LIST_SUBCOMMAND = "list"
    }
    
    override fun execute(command: String): Boolean {
        if (!command.startsWith(DISCO_COMMAND_PREFIX)) {
            return false
        }
        
        val parts = command.split(" ")
        if (parts.size < 2) {
            showUsage()
            return true
        }
        
        when (parts[1]) {
            EXEC_SUBCOMMAND -> {
                if (parts.size < 4) {
                    showUsage()
                    return true
                }
                val containerId = parts[2]
                val containerCommand = parts.drop(3).joinToString(" ")
                executeContainerCommand(containerId, containerCommand)
            }
            CONNECT_SUBCOMMAND -> {
                if (parts.size < 3) {
                    showUsage()
                    return true
                }
                val containerId = parts[2]
                openContainerTerminal(containerId)
            }
            LIST_SUBCOMMAND -> {
                listContainers()
            }
            else -> {
                showUsage()
            }
        }
        
        return true
    }
    
    private fun showUsage() {
        println("Disco MCP Commands:")
        println("  disco exec <container-id> <command>  - Execute command in container")
        println("  disco connect <container-id>         - Open terminal session to container") 
        println("  disco list                           - List available containers")
    }
    
    private fun executeContainerCommand(containerId: String, command: String) {
        val projectService = project.service<DiscoProjectService>()
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                println("Executing command '$command' in container $containerId")
                
                val result = projectService.executeCommand(containerId, command)
                
                withContext(Dispatchers.Main) {
                    if (result != null) {
                        if (result.stdout.isNotEmpty()) {
                            println(result.stdout)
                        }
                        if (result.stderr.isNotEmpty()) {
                            System.err.println(result.stderr)
                        }
                        if (result.exitCode != 0) {
                            println("[Exit code: ${result.exitCode}]")
                        }
                    } else {
                        println("Failed to execute command")
                    }
                }
                
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    println("Error executing command: ${e.message}")
                }
            }
        }
    }
    
    private fun openContainerTerminal(containerId: String) {
        val projectService = project.service<DiscoProjectService>()
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Create a new terminal session for the container
                val sessionResult = projectService.createTerminalSession(containerId)
                
                withContext(Dispatchers.Main) {
                    if (sessionResult != null) {
                        println("🚀 Connected to Disco MCP Container")
                        println("Session ID: ${sessionResult.sessionId}")
                        println("Working Directory: ${sessionResult.workingDirectory}")
                        println("Use 'exit' to disconnect from container terminal")
                        
                        // Note: In a full implementation, this would switch the terminal
                        // to an interactive mode that forwards all input to the container
                        Messages.showInfoMessage(
                            project,
                            "Terminal session created for container $containerId\nSession ID: ${sessionResult.sessionId}",
                            "Disco MCP Terminal"
                        )
                    } else {
                        println("Failed to create terminal session")
                    }
                }
                
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    println("Error connecting to container: ${e.message}")
                }
            }
        }
    }
    
    private fun listContainers() {
        val projectService = project.service<DiscoProjectService>()
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val containers = projectService.listContainers()
                
                withContext(Dispatchers.Main) {
                    if (containers.isNotEmpty()) {
                        println("Available Containers:")
                        containers.forEach { container ->
                            println("  ${container.id} - ${container.name} (${container.status})")
                        }
                    } else {
                        println("No containers available")
                    }
                }
                
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    println("Error listing containers: ${e.message}")
                }
            }
        }
    }
}
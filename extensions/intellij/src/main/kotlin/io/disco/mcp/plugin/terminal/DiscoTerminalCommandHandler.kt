package io.disco.mcp.plugin.terminal

import com.intellij.openapi.project.Project
import com.intellij.terminal.TerminalCustomCommandHandler
import io.disco.mcp.plugin.services.DiscoProjectService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Custom terminal command handler for Disco MCP containers
 * Handles commands like: disco exec <container-id> <command>
 */
class DiscoTerminalCommandHandler : TerminalCustomCommandHandler {
    
    companion object {
        private const val DISCO_COMMAND_PREFIX = "disco"
        private const val EXEC_SUBCOMMAND = "exec"
    }
    
    override fun execute(command: String): Boolean {
        if (!command.startsWith(DISCO_COMMAND_PREFIX)) {
            return false
        }
        
        val parts = command.split(" ")
        if (parts.size < 3 || parts[1] != EXEC_SUBCOMMAND) {
            return false
        }
        
        val containerId = parts[2]
        val containerCommand = parts.drop(3).joinToString(" ")
        
        executeContainerCommand(containerId, containerCommand)
        return true
    }
    
    private fun executeContainerCommand(containerId: String, command: String) {
        // Get the current project - this would need to be injected properly
        // For now this is a simplified implementation
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // This would be implemented with proper project context
                println("Executing command '$command' in container $containerId")
                // The actual implementation would use DiscoProjectService to execute the command
                // and stream the output back to the terminal
            } catch (e: Exception) {
                println("Error executing command: ${e.message}")
            }
        }
    }
}
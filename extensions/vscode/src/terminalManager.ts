import * as vscode from 'vscode';
import { DiscoMCPClient } from './client';

export class TerminalManager {
    private terminals: Map<string, vscode.Terminal> = new Map();

    constructor(private client: DiscoMCPClient) {
        // Clean up terminals when they are closed
        vscode.window.onDidCloseTerminal((terminal) => {
            for (const [key, term] of this.terminals) {
                if (term === terminal) {
                    this.terminals.delete(key);
                    break;
                }
            }
        });
    }

    async openTerminal(containerId: string, containerName: string): Promise<void> {
        const terminalKey = `${containerId}:${containerName}`;
        
        // Check if terminal already exists
        let terminal = this.terminals.get(terminalKey);
        
        if (terminal) {
            // Terminal exists, just show it
            terminal.show();
            return;
        }

        // Create new terminal with custom implementation
        terminal = vscode.window.createTerminal({
            name: `Disco: ${containerName}`,
            pty: new DiscoTerminalPty(this.client, containerId)
        });

        this.terminals.set(terminalKey, terminal);
        terminal.show();
    }

    disposeAll(): void {
        for (const terminal of this.terminals.values()) {
            terminal.dispose();
        }
        this.terminals.clear();
    }
}

class DiscoTerminalPty implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;

    private closeEmitter = new vscode.EventEmitter<number | void>();
    onDidClose?: vscode.Event<number | void> = this.closeEmitter.event;

    private currentDirectory: string = '/';
    private sessionId: string | null = null;

    constructor(
        private client: DiscoMCPClient,
        private containerId: string
    ) {}

    async open(initialDimensions: vscode.TerminalDimensions | undefined): Promise<void> {
        try {
            // Create a new terminal session
            const session = await this.client.createTerminalSession(this.containerId);
            this.sessionId = session.sessionId;
            this.currentDirectory = session.workingDirectory;
            
            // Show welcome message
            this.writeEmitter.fire(`\r\n\x1b[1;32m🚀 Connected to Disco MCP Container\x1b[0m\r\n`);
            this.writeEmitter.fire(`Session ID: ${this.sessionId}\r\n`);
            this.writeEmitter.fire(`Working Directory: ${this.currentDirectory}\r\n\r\n`);
            this.showPrompt();
        } catch (error) {
            this.writeEmitter.fire(`\r\n\x1b[1;31mError: Failed to connect to container terminal\x1b[0m\r\n`);
            this.writeEmitter.fire(`${error}\r\n`);
            this.closeEmitter.fire(1);
        }
    }

    close(): void {
        // Cleanup when terminal is closed
        this.sessionId = null;
    }

    private currentCommand: string = '';

    async handleInput(data: string): Promise<void> {
        if (!this.sessionId) {
            return;
        }

        // Handle special keys
        if (data === '\r') {
            // Enter key - execute command
            this.writeEmitter.fire('\r\n');
            
            if (this.currentCommand.trim()) {
                await this.executeCommand(this.currentCommand.trim());
            }
            
            this.currentCommand = '';
            this.showPrompt();
        } else if (data === '\x7f') {
            // Backspace
            if (this.currentCommand.length > 0) {
                this.currentCommand = this.currentCommand.slice(0, -1);
                this.writeEmitter.fire('\b \b');
            }
        } else if (data === '\x03') {
            // Ctrl+C
            this.writeEmitter.fire('^C\r\n');
            this.currentCommand = '';
            this.showPrompt();
        } else if (data >= ' ') {
            // Printable character
            this.currentCommand += data;
            this.writeEmitter.fire(data);
        }
    }

    private async executeCommand(command: string): Promise<void> {
        try {
            // Show command being executed
            this.writeEmitter.fire(`\x1b[2m$ ${command}\x1b[0m\r\n`);
            
            // Execute command via Disco MCP API
            const result = await this.client.executeCommand(
                this.containerId,
                command,
                this.currentDirectory
            );

            // Display stdout
            if (result.stdout) {
                this.writeEmitter.fire(result.stdout.replace(/\n/g, '\r\n'));
            }

            // Display stderr in red
            if (result.stderr) {
                this.writeEmitter.fire(`\x1b[1;31m${result.stderr.replace(/\n/g, '\r\n')}\x1b[0m`);
            }

            // Update working directory if command was 'cd'
            if (command.startsWith('cd ')) {
                const newDir = command.slice(3).trim();
                if (newDir && result.exitCode === 0) {
                    // Update current directory (simplified logic)
                    if (newDir.startsWith('/')) {
                        this.currentDirectory = newDir;
                    } else if (newDir === '..') {
                        const parts = this.currentDirectory.split('/').filter(p => p);
                        parts.pop();
                        this.currentDirectory = '/' + parts.join('/');
                    } else {
                        this.currentDirectory = this.currentDirectory.endsWith('/') 
                            ? this.currentDirectory + newDir
                            : this.currentDirectory + '/' + newDir;
                    }
                }
            }

            // Show exit code if non-zero
            if (result.exitCode !== 0) {
                this.writeEmitter.fire(`\x1b[1;31m[Exit code: ${result.exitCode}]\x1b[0m\r\n`);
            }

        } catch (error) {
            this.writeEmitter.fire(`\x1b[1;31mError executing command: ${error}\x1b[0m\r\n`);
        }
    }

    private showPrompt(): void {
        const prompt = `\x1b[1;34m${this.currentDirectory}\x1b[0m\x1b[1;32m $ \x1b[0m`;
        this.writeEmitter.fire(prompt);
    }
}
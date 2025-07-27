import * as vscode from 'vscode';
import { DiscoMCPClient } from './client';
import { ContainerProvider } from './containerProvider';
import { TerminalManager } from './terminalManager';
import { FileSyncManager } from './fileSyncManager';

let client: DiscoMCPClient;
let containerProvider: ContainerProvider;
let terminalManager: TerminalManager;
let fileSyncManager: FileSyncManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Disco MCP Extension is now active!');

    // Initialize core components
    client = new DiscoMCPClient();
    containerProvider = new ContainerProvider(client);
    terminalManager = new TerminalManager(client);
    fileSyncManager = new FileSyncManager(client);

    // Register tree data provider
    vscode.window.registerTreeDataProvider('discoExplorer', containerProvider);

    // Register commands
    const commands = [
        vscode.commands.registerCommand('disco.connectServer', async () => {
            await connectToServer();
        }),
        
        vscode.commands.registerCommand('disco.disconnectServer', async () => {
            await disconnectFromServer();
        }),
        
        vscode.commands.registerCommand('disco.createContainer', async () => {
            await createContainer();
        }),
        
        vscode.commands.registerCommand('disco.deleteContainer', async (item) => {
            await deleteContainer(item);
        }),
        
        vscode.commands.registerCommand('disco.openTerminal', async (item) => {
            await openTerminal(item);
        }),
        
        vscode.commands.registerCommand('disco.refreshContainers', async () => {
            containerProvider.refresh();
        }),
        
        vscode.commands.registerCommand('disco.syncFiles', async (item) => {
            await syncFiles(item);
        })
    ];

    context.subscriptions.push(...commands);

    // Auto-connect if credentials are available
    const config = vscode.workspace.getConfiguration('disco');
    if (config.get('serverUrl') && config.get('apiKey')) {
        connectToServer();
    }

    // Watch for file changes and auto-sync if enabled
    if (config.get('autoSync')) {
        setupAutoSync();
    }
}

async function connectToServer(): Promise<void> {
    const config = vscode.workspace.getConfiguration('disco');
    let serverUrl = config.get<string>('serverUrl');
    let apiKey = config.get<string>('apiKey');

    // Prompt for server URL if not configured
    if (!serverUrl) {
        serverUrl = await vscode.window.showInputBox({
            prompt: 'Enter Disco MCP Server URL',
            value: 'https://disco-mcp.up.railway.app',
            placeHolder: 'https://disco-mcp.up.railway.app'
        });
        
        if (!serverUrl) {
            return;
        }
        
        await config.update('serverUrl', serverUrl, vscode.ConfigurationTarget.Workspace);
    }

    // Prompt for API key if not configured
    if (!apiKey) {
        apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Disco MCP API Key',
            password: true,
            placeHolder: 'API Key'
        });
        
        if (!apiKey) {
            return;
        }
        
        await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Workspace);
    }

    try {
        vscode.window.showInformationMessage('Connecting to Disco MCP Server...');
        
        await client.connect(serverUrl, apiKey);
        
        // Set context to show tree view
        vscode.commands.executeCommand('setContext', 'disco.connected', true);
        
        vscode.window.showInformationMessage('Successfully connected to Disco MCP Server!');
        
        // Refresh containers view
        containerProvider.refresh();
        
    } catch (error) {
        console.error('Failed to connect to Disco MCP Server:', error);
        vscode.window.showErrorMessage(`Failed to connect: ${error}`);
    }
}

async function disconnectFromServer(): Promise<void> {
    await client.disconnect();
    vscode.commands.executeCommand('setContext', 'disco.connected', false);
    containerProvider.refresh();
    vscode.window.showInformationMessage('Disconnected from Disco MCP Server');
}

async function createContainer(): Promise<void> {
    const name = await vscode.window.showInputBox({
        prompt: 'Enter container name',
        placeHolder: 'my-project'
    });
    
    if (!name) {
        return;
    }

    try {
        vscode.window.showInformationMessage('Creating container...');
        await client.createContainer(name);
        containerProvider.refresh();
        vscode.window.showInformationMessage(`Container '${name}' created successfully!`);
    } catch (error) {
        console.error('Failed to create container:', error);
        vscode.window.showErrorMessage(`Failed to create container: ${error}`);
    }
}

async function deleteContainer(item: any): Promise<void> {
    const confirmation = await vscode.window.showWarningMessage(
        `Are you sure you want to delete container '${item.label}'?`,
        'Yes', 'No'
    );
    
    if (confirmation !== 'Yes') {
        return;
    }

    try {
        await client.deleteContainer(item.containerId);
        containerProvider.refresh();
        vscode.window.showInformationMessage(`Container '${item.label}' deleted successfully!`);
    } catch (error) {
        console.error('Failed to delete container:', error);
        vscode.window.showErrorMessage(`Failed to delete container: ${error}`);
    }
}

async function openTerminal(item: any): Promise<void> {
    try {
        await terminalManager.openTerminal(item.containerId, item.label);
    } catch (error) {
        console.error('Failed to open terminal:', error);
        vscode.window.showErrorMessage(`Failed to open terminal: ${error}`);
    }
}

async function syncFiles(item: any): Promise<void> {
    try {
        vscode.window.showInformationMessage('Syncing files...');
        await fileSyncManager.syncWorkspace(item.containerId);
        vscode.window.showInformationMessage('Files synced successfully!');
    } catch (error) {
        console.error('Failed to sync files:', error);
        vscode.window.showErrorMessage(`Failed to sync files: ${error}`);
    }
}

function setupAutoSync(): void {
    const config = vscode.workspace.getConfiguration('disco');
    const interval = config.get<number>('syncInterval', 30) * 1000;
    
    setInterval(async () => {
        if (client.isConnected() && containerProvider.hasContainers()) {
            // Auto-sync with active containers
            const containers = await containerProvider.getContainers();
            for (const container of containers) {
                try {
                    await fileSyncManager.syncWorkspace(container.id);
                } catch (error) {
                    console.error(`Auto-sync failed for container ${container.id}:`, error);
                }
            }
        }
    }, interval);
}

export function deactivate() {
    if (client) {
        client.disconnect();
    }
}
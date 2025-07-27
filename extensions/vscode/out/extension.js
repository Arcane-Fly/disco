"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const client_1 = require("./client");
const containerProvider_1 = require("./containerProvider");
const terminalManager_1 = require("./terminalManager");
const fileSyncManager_1 = require("./fileSyncManager");
let client;
let containerProvider;
let terminalManager;
let fileSyncManager;
function activate(context) {
    console.log('Disco MCP Extension is now active!');
    // Initialize core components
    client = new client_1.DiscoMCPClient();
    containerProvider = new containerProvider_1.ContainerProvider(client);
    terminalManager = new terminalManager_1.TerminalManager(client);
    fileSyncManager = new fileSyncManager_1.FileSyncManager(client);
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
async function connectToServer() {
    const config = vscode.workspace.getConfiguration('disco');
    let serverUrl = config.get('serverUrl');
    let apiKey = config.get('apiKey');
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
    }
    catch (error) {
        console.error('Failed to connect to Disco MCP Server:', error);
        vscode.window.showErrorMessage(`Failed to connect: ${error}`);
    }
}
async function disconnectFromServer() {
    await client.disconnect();
    vscode.commands.executeCommand('setContext', 'disco.connected', false);
    containerProvider.refresh();
    vscode.window.showInformationMessage('Disconnected from Disco MCP Server');
}
async function createContainer() {
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
    }
    catch (error) {
        console.error('Failed to create container:', error);
        vscode.window.showErrorMessage(`Failed to create container: ${error}`);
    }
}
async function deleteContainer(item) {
    const confirmation = await vscode.window.showWarningMessage(`Are you sure you want to delete container '${item.label}'?`, 'Yes', 'No');
    if (confirmation !== 'Yes') {
        return;
    }
    try {
        await client.deleteContainer(item.containerId);
        containerProvider.refresh();
        vscode.window.showInformationMessage(`Container '${item.label}' deleted successfully!`);
    }
    catch (error) {
        console.error('Failed to delete container:', error);
        vscode.window.showErrorMessage(`Failed to delete container: ${error}`);
    }
}
async function openTerminal(item) {
    try {
        await terminalManager.openTerminal(item.containerId, item.label);
    }
    catch (error) {
        console.error('Failed to open terminal:', error);
        vscode.window.showErrorMessage(`Failed to open terminal: ${error}`);
    }
}
async function syncFiles(item) {
    try {
        vscode.window.showInformationMessage('Syncing files...');
        await fileSyncManager.syncWorkspace(item.containerId);
        vscode.window.showInformationMessage('Files synced successfully!');
    }
    catch (error) {
        console.error('Failed to sync files:', error);
        vscode.window.showErrorMessage(`Failed to sync files: ${error}`);
    }
}
function setupAutoSync() {
    const config = vscode.workspace.getConfiguration('disco');
    const interval = config.get('syncInterval', 30) * 1000;
    setInterval(async () => {
        if (client.isConnected() && containerProvider.hasContainers()) {
            // Auto-sync with active containers
            const containers = await containerProvider.getContainers();
            for (const container of containers) {
                try {
                    await fileSyncManager.syncWorkspace(container.id);
                }
                catch (error) {
                    console.error(`Auto-sync failed for container ${container.id}:`, error);
                }
            }
        }
    }, interval);
}
function deactivate() {
    if (client) {
        client.disconnect();
    }
}
//# sourceMappingURL=extension.js.map
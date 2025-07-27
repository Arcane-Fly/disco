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
exports.FileSyncManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class FileSyncManager {
    constructor(client) {
        this.client = client;
        this.syncInProgress = new Set();
        this.fileWatcher = null;
        this.setupFileWatcher();
    }
    setupFileWatcher() {
        // Watch for file changes in the workspace
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*', false, // ignoreCreateEvents
        false, // ignoreChangeEvents
        false // ignoreDeleteEvents
        );
        // Auto-sync on file changes if enabled
        this.fileWatcher.onDidChange(async (uri) => {
            const config = vscode.workspace.getConfiguration('disco');
            if (config.get('autoSync') && this.client.isConnected()) {
                await this.syncFileToContainers(uri);
            }
        });
        this.fileWatcher.onDidCreate(async (uri) => {
            const config = vscode.workspace.getConfiguration('disco');
            if (config.get('autoSync') && this.client.isConnected()) {
                await this.syncFileToContainers(uri);
            }
        });
        this.fileWatcher.onDidDelete(async (uri) => {
            const config = vscode.workspace.getConfiguration('disco');
            if (config.get('autoSync') && this.client.isConnected()) {
                await this.deleteFileFromContainers(uri);
            }
        });
    }
    async syncWorkspace(containerId) {
        if (this.syncInProgress.has(containerId)) {
            vscode.window.showWarningMessage('Sync already in progress for this container');
            return;
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }
        this.syncInProgress.add(containerId);
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Syncing workspace with container',
                cancellable: true
            }, async (progress, token) => {
                const workspaceRoot = workspaceFolders[0].uri.fsPath;
                await this.syncDirectoryRecursive(containerId, workspaceRoot, '/', progress, token);
            });
            vscode.window.showInformationMessage('Workspace synced successfully!');
        }
        catch (error) {
            console.error('Sync failed:', error);
            vscode.window.showErrorMessage(`Sync failed: ${error}`);
        }
        finally {
            this.syncInProgress.delete(containerId);
        }
    }
    async syncDirectoryRecursive(containerId, localPath, remotePath, progress, token) {
        if (token.isCancellationRequested) {
            throw new Error('Sync cancelled by user');
        }
        try {
            const stats = fs.statSync(localPath);
            if (stats.isDirectory()) {
                progress.report({ message: `Syncing directory ${remotePath}` });
                // Get local directory contents
                const localFiles = fs.readdirSync(localPath);
                // Filter out ignored files/directories
                const filteredFiles = localFiles.filter(file => !this.shouldIgnoreFile(file));
                // Sync each file/directory
                for (const file of filteredFiles) {
                    const localFilePath = path.join(localPath, file);
                    const remoteFilePath = remotePath === '/' ? `/${file}` : `${remotePath}/${file}`;
                    await this.syncDirectoryRecursive(containerId, localFilePath, remoteFilePath, progress, token);
                }
            }
            else if (stats.isFile()) {
                await this.syncFile(containerId, localPath, remotePath, progress);
            }
        }
        catch (error) {
            console.error(`Failed to sync ${localPath}:`, error);
            // Continue with other files even if one fails
        }
    }
    async syncFile(containerId, localPath, remotePath, progress) {
        try {
            progress.report({ message: `Syncing ${path.basename(localPath)}` });
            // Read local file content
            const localContent = fs.readFileSync(localPath, 'utf8');
            // Check if remote file exists and compare content
            let needsUpdate = true;
            try {
                const remoteContent = await this.client.readFile(containerId, remotePath);
                needsUpdate = localContent !== remoteContent;
            }
            catch (error) {
                // File doesn't exist remotely, needs to be created
                needsUpdate = true;
            }
            if (needsUpdate) {
                await this.client.writeFile(containerId, remotePath, localContent);
                console.log(`Synced file: ${localPath} -> ${remotePath}`);
            }
        }
        catch (error) {
            console.error(`Failed to sync file ${localPath}:`, error);
            throw error;
        }
    }
    async syncFileToContainers(uri) {
        // Get all active containers and sync to each
        try {
            const containers = await this.client.listContainers();
            const activeContainers = containers.filter(c => c.status === 'running');
            for (const container of activeContainers) {
                try {
                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (!workspaceFolders)
                        continue;
                    const workspaceRoot = workspaceFolders[0].uri.fsPath;
                    const relativePath = path.relative(workspaceRoot, uri.fsPath);
                    const remotePath = '/' + relativePath.replace(/\\/g, '/');
                    if (!this.shouldIgnoreFile(path.basename(uri.fsPath))) {
                        await this.syncFile(container.id, uri.fsPath, remotePath, {
                            report: () => { } // No-op progress for auto-sync
                        });
                    }
                }
                catch (error) {
                    console.error(`Failed to auto-sync to container ${container.id}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Failed to auto-sync file:', error);
        }
    }
    async deleteFileFromContainers(uri) {
        try {
            const containers = await this.client.listContainers();
            const activeContainers = containers.filter(c => c.status === 'running');
            for (const container of activeContainers) {
                try {
                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (!workspaceFolders)
                        continue;
                    const workspaceRoot = workspaceFolders[0].uri.fsPath;
                    const relativePath = path.relative(workspaceRoot, uri.fsPath);
                    const remotePath = '/' + relativePath.replace(/\\/g, '/');
                    await this.client.deleteFile(container.id, remotePath);
                }
                catch (error) {
                    // File might not exist remotely, which is fine
                    console.log(`File ${uri.fsPath} not found in container ${container.id}`);
                }
            }
        }
        catch (error) {
            console.error('Failed to delete file from containers:', error);
        }
    }
    shouldIgnoreFile(filename) {
        const ignorePatterns = [
            'node_modules',
            '.git',
            '.vscode',
            '.DS_Store',
            'Thumbs.db',
            '*.log',
            'dist',
            'build',
            'out',
            '.env',
            '.env.local',
            '.env.development',
            '.env.production'
        ];
        return ignorePatterns.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace('*', '.*'));
                return regex.test(filename);
            }
            return filename === pattern;
        });
    }
    async pullFromContainer(containerId) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Pulling files from container',
                cancellable: true
            }, async (progress, token) => {
                const workspaceRoot = workspaceFolders[0].uri.fsPath;
                await this.pullDirectoryRecursive(containerId, '/', workspaceRoot, progress, token);
            });
            vscode.window.showInformationMessage('Files pulled successfully!');
        }
        catch (error) {
            console.error('Pull failed:', error);
            vscode.window.showErrorMessage(`Pull failed: ${error}`);
        }
    }
    async pullDirectoryRecursive(containerId, remotePath, localPath, progress, token) {
        if (token.isCancellationRequested) {
            throw new Error('Pull cancelled by user');
        }
        try {
            const remoteFiles = await this.client.listFiles(containerId, remotePath);
            for (const file of remoteFiles) {
                if (this.shouldIgnoreFile(file.name)) {
                    continue;
                }
                const localFilePath = path.join(localPath, file.name);
                const remoteFilePath = remotePath === '/' ? `/${file.name}` : `${remotePath}/${file.name}`;
                if (file.type === 'directory') {
                    // Create directory if it doesn't exist
                    if (!fs.existsSync(localFilePath)) {
                        fs.mkdirSync(localFilePath, { recursive: true });
                    }
                    await this.pullDirectoryRecursive(containerId, remoteFilePath, localFilePath, progress, token);
                }
                else {
                    progress.report({ message: `Pulling ${file.name}` });
                    // Read remote file content
                    const remoteContent = await this.client.readFile(containerId, remoteFilePath);
                    // Write to local file
                    fs.writeFileSync(localFilePath, remoteContent, 'utf8');
                }
            }
        }
        catch (error) {
            console.error(`Failed to pull directory ${remotePath}:`, error);
            throw error;
        }
    }
    dispose() {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }
}
exports.FileSyncManager = FileSyncManager;
//# sourceMappingURL=fileSyncManager.js.map
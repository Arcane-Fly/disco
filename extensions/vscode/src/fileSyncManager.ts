import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { DiscoMCPClient, FileItem } from './client';

export class FileSyncManager {
    private syncInProgress: Set<string> = new Set();
    private fileWatcher: vscode.FileSystemWatcher | null = null;

    constructor(private client: DiscoMCPClient) {
        this.setupFileWatcher();
    }

    private setupFileWatcher(): void {
        // Watch for file changes in the workspace
        this.fileWatcher = vscode.workspace.createFileSystemWatcher(
            '**/*',
            false, // ignoreCreateEvents
            false, // ignoreChangeEvents
            false  // ignoreDeleteEvents
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

    async syncWorkspace(containerId: string): Promise<void> {
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
        } catch (error) {
            console.error('Sync failed:', error);
            vscode.window.showErrorMessage(`Sync failed: ${error}`);
        } finally {
            this.syncInProgress.delete(containerId);
        }
    }

    private async syncDirectoryRecursive(
        containerId: string,
        localPath: string,
        remotePath: string,
        progress: vscode.Progress<{message?: string; increment?: number}>,
        token: vscode.CancellationToken
    ): Promise<void> {
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
                const filteredFiles = localFiles.filter(file => 
                    !this.shouldIgnoreFile(file)
                );

                // Sync each file/directory
                for (const file of filteredFiles) {
                    const localFilePath = path.join(localPath, file);
                    const remoteFilePath = remotePath === '/' ? `/${file}` : `${remotePath}/${file}`;
                    
                    await this.syncDirectoryRecursive(
                        containerId,
                        localFilePath,
                        remoteFilePath,
                        progress,
                        token
                    );
                }
            } else if (stats.isFile()) {
                await this.syncFile(containerId, localPath, remotePath, progress);
            }
        } catch (error) {
            console.error(`Failed to sync ${localPath}:`, error);
            // Continue with other files even if one fails
        }
    }

    private async syncFile(
        containerId: string,
        localPath: string,
        remotePath: string,
        progress: vscode.Progress<{message?: string; increment?: number}>
    ): Promise<void> {
        try {
            progress.report({ message: `Syncing ${path.basename(localPath)}` });
            
            // Read local file content
            const localContent = fs.readFileSync(localPath, 'utf8');
            
            // Check if remote file exists and compare content
            let needsUpdate = true;
            try {
                const remoteContent = await this.client.readFile(containerId, remotePath);
                needsUpdate = localContent !== remoteContent;
            } catch (error) {
                // File doesn't exist remotely, needs to be created
                needsUpdate = true;
            }

            if (needsUpdate) {
                await this.client.writeFile(containerId, remotePath, localContent);
                console.log(`Synced file: ${localPath} -> ${remotePath}`);
            }
        } catch (error) {
            console.error(`Failed to sync file ${localPath}:`, error);
            throw error;
        }
    }

    private async syncFileToContainers(uri: vscode.Uri): Promise<void> {
        // Get all active containers and sync to each
        try {
            const containers = await this.client.listContainers();
            const activeContainers = containers.filter(c => c.status === 'running');
            
            for (const container of activeContainers) {
                try {
                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (!workspaceFolders) continue;
                    
                    const workspaceRoot = workspaceFolders[0].uri.fsPath;
                    const relativePath = path.relative(workspaceRoot, uri.fsPath);
                    const remotePath = '/' + relativePath.replace(/\\/g, '/');
                    
                    if (!this.shouldIgnoreFile(path.basename(uri.fsPath))) {
                        await this.syncFile(container.id, uri.fsPath, remotePath, {
                            report: () => {} // No-op progress for auto-sync
                        } as any);
                    }
                } catch (error) {
                    console.error(`Failed to auto-sync to container ${container.id}:`, error);
                }
            }
        } catch (error) {
            console.error('Failed to auto-sync file:', error);
        }
    }

    private async deleteFileFromContainers(uri: vscode.Uri): Promise<void> {
        try {
            const containers = await this.client.listContainers();
            const activeContainers = containers.filter(c => c.status === 'running');
            
            for (const container of activeContainers) {
                try {
                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (!workspaceFolders) continue;
                    
                    const workspaceRoot = workspaceFolders[0].uri.fsPath;
                    const relativePath = path.relative(workspaceRoot, uri.fsPath);
                    const remotePath = '/' + relativePath.replace(/\\/g, '/');
                    
                    await this.client.deleteFile(container.id, remotePath);
                } catch (error) {
                    // File might not exist remotely, which is fine
                    console.log(`File ${uri.fsPath} not found in container ${container.id}`);
                }
            }
        } catch (error) {
            console.error('Failed to delete file from containers:', error);
        }
    }

    private shouldIgnoreFile(filename: string): boolean {
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

    async pullFromContainer(containerId: string): Promise<void> {
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
        } catch (error) {
            console.error('Pull failed:', error);
            vscode.window.showErrorMessage(`Pull failed: ${error}`);
        }
    }

    private async pullDirectoryRecursive(
        containerId: string,
        remotePath: string,
        localPath: string,
        progress: vscode.Progress<{message?: string; increment?: number}>,
        token: vscode.CancellationToken
    ): Promise<void> {
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
                    
                    await this.pullDirectoryRecursive(
                        containerId,
                        remoteFilePath,
                        localFilePath,
                        progress,
                        token
                    );
                } else {
                    progress.report({ message: `Pulling ${file.name}` });
                    
                    // Read remote file content
                    const remoteContent = await this.client.readFile(containerId, remoteFilePath);
                    
                    // Write to local file
                    fs.writeFileSync(localFilePath, remoteContent, 'utf8');
                }
            }
        } catch (error) {
            console.error(`Failed to pull directory ${remotePath}:`, error);
            throw error;
        }
    }

    dispose(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }
}
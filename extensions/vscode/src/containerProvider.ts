import * as vscode from 'vscode';
import { DiscoMCPClient, Container } from './client';

export class ContainerProvider implements vscode.TreeDataProvider<ContainerItem | ContainerActionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ContainerItem | ContainerActionItem | undefined | null | void> = new vscode.EventEmitter<ContainerItem | ContainerActionItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ContainerItem | ContainerActionItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private containers: Container[] = [];

    constructor(private client: DiscoMCPClient) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ContainerItem | ContainerActionItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ContainerItem | ContainerActionItem): Promise<(ContainerItem | ContainerActionItem)[]> {
        if (!this.client.isConnected()) {
            return [];
        }

        if (!element || element instanceof ContainerItem) {
            const containerElement = element as ContainerItem | undefined;
            
            if (!containerElement) {
                // Root level - show containers
                try {
                    this.containers = await this.client.listContainers();
                    return this.containers.map(container => new ContainerItem(
                        container.name,
                        container.id,
                        container.status,
                        vscode.TreeItemCollapsibleState.Collapsed
                    ));
                } catch (error) {
                    console.error('Failed to load containers:', error);
                    vscode.window.showErrorMessage(`Failed to load containers: ${error}`);
                    return [];
                }
            } else {
                // Container level - show container actions/info
                return [
                    new ContainerActionItem('Open Terminal', 'terminal', containerElement.containerId),
                    new ContainerActionItem('Sync Files', 'sync', containerElement.containerId),
                    new ContainerActionItem('Git Status', 'git', containerElement.containerId),
                    new ContainerActionItem('File Explorer', 'files', containerElement.containerId)
                ];
            }
        }
        
        return [];
    }

    hasContainers(): boolean {
        return this.containers.length > 0;
    }

    async getContainers(): Promise<Container[]> {
        return this.containers;
    }
}

export class ContainerItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly containerId: string,
        public readonly status: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        
        this.contextValue = 'container';
        this.tooltip = `Container: ${label} (${status})`;
        
        // Set icon based on status
        switch (status) {
            case 'running':
                this.iconPath = new vscode.ThemeIcon('play-circle', new vscode.ThemeColor('charts.green'));
                break;
            case 'stopped':
                this.iconPath = new vscode.ThemeIcon('stop-circle', new vscode.ThemeColor('charts.red'));
                break;
            case 'error':
                this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red'));
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('circle-outline');
        }
        
        // Add status badge to description
        this.description = status.toUpperCase();
    }
}

export class ContainerActionItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly action: string,
        public readonly containerId: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        
        this.contextValue = 'containerAction';
        this.command = {
            command: this.getCommand(),
            title: label,
            arguments: [{ containerId, action, label }]
        };
        
        // Set appropriate icon
        switch (action) {
            case 'terminal':
                this.iconPath = new vscode.ThemeIcon('terminal');
                break;
            case 'sync':
                this.iconPath = new vscode.ThemeIcon('sync');
                break;
            case 'git':
                this.iconPath = new vscode.ThemeIcon('git-branch');
                break;
            case 'files':
                this.iconPath = new vscode.ThemeIcon('folder');
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('gear');
        }
    }
    
    private getCommand(): string {
        switch (this.action) {
            case 'terminal':
                return 'disco.openTerminal';
            case 'sync':
                return 'disco.syncFiles';
            case 'git':
                return 'disco.gitStatus';
            case 'files':
                return 'disco.openFileExplorer';
            default:
                return 'disco.containerAction';
        }
    }
}
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
exports.ContainerActionItem = exports.ContainerItem = exports.ContainerProvider = void 0;
const vscode = __importStar(require("vscode"));
class ContainerProvider {
    constructor(client) {
        this.client = client;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.containers = [];
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!this.client.isConnected()) {
            return [];
        }
        if (!element || element instanceof ContainerItem) {
            const containerElement = element;
            if (!containerElement) {
                // Root level - show containers
                try {
                    this.containers = await this.client.listContainers();
                    return this.containers.map(container => new ContainerItem(container.name, container.id, container.status, vscode.TreeItemCollapsibleState.Collapsed));
                }
                catch (error) {
                    console.error('Failed to load containers:', error);
                    vscode.window.showErrorMessage(`Failed to load containers: ${error}`);
                    return [];
                }
            }
            else {
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
    hasContainers() {
        return this.containers.length > 0;
    }
    async getContainers() {
        return this.containers;
    }
}
exports.ContainerProvider = ContainerProvider;
class ContainerItem extends vscode.TreeItem {
    constructor(label, containerId, status, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.containerId = containerId;
        this.status = status;
        this.collapsibleState = collapsibleState;
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
exports.ContainerItem = ContainerItem;
class ContainerActionItem extends vscode.TreeItem {
    constructor(label, action, containerId) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.action = action;
        this.containerId = containerId;
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
    getCommand() {
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
exports.ContainerActionItem = ContainerActionItem;
//# sourceMappingURL=containerProvider.js.map
import { Browser, BrowserContext, Page } from 'playwright';
interface BrowserSession {
    browser: Browser;
    context: BrowserContext;
    page: Page;
    containerId: string;
    createdAt: Date;
    lastUsed: Date;
}
/**
 * Browser automation manager for computer-use functionality
 */
declare class BrowserAutomationManager {
    private sessions;
    private cleanupInterval;
    constructor();
    /**
     * Get or create a browser session for a container
     */
    getBrowserSession(containerId: string, containerUrl?: string): Promise<BrowserSession>;
    /**
     * Create a new browser session
     */
    private createBrowserSession;
    /**
     * Take a screenshot of the browser session
     */
    takeScreenshot(containerId: string, options?: {
        width?: number;
        height?: number;
        format?: 'png' | 'jpeg';
    }): Promise<string>;
    /**
     * Simulate mouse click
     */
    simulateClick(containerId: string, options: {
        x: number;
        y: number;
        button?: 'left' | 'right' | 'middle';
        doubleClick?: boolean;
    }): Promise<void>;
    /**
     * Simulate typing
     */
    simulateTyping(containerId: string, options: {
        text: string;
        delay?: number;
    }): Promise<void>;
    /**
     * Simulate key press
     */
    simulateKeyPress(containerId: string, options: {
        key: string;
        modifiers?: string[];
    }): Promise<void>;
    /**
     * Navigate to a URL in the browser session
     */
    navigateToUrl(containerId: string, url: string): Promise<void>;
    /**
     * Execute JavaScript in the browser session
     */
    executeScript(containerId: string, script: string): Promise<any>;
    /**
     * Close browser session for a container
     */
    closeBrowserSession(containerId: string): Promise<void>;
    /**
     * Clean up inactive browser sessions
     */
    private cleanupInactiveSessions;
    /**
     * Shutdown all browser sessions
     */
    shutdown(): Promise<void>;
    /**
     * Get browser session statistics
     */
    getStats(): {
        activeSessions: number;
        sessionsByContainer: string[];
    };
}
export declare const browserAutomationManager: BrowserAutomationManager;
export {};
//# sourceMappingURL=browserAutomation.d.ts.map
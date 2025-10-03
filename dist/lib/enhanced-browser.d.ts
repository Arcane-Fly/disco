import { Browser, BrowserContext, Page } from 'playwright';
export interface BrowserSession {
    id: string;
    containerId: string;
    browser?: Browser;
    context?: BrowserContext;
    pages: Map<string, Page>;
    createdAt: Date;
    lastUsed: Date;
    config: BrowserSessionConfig;
}
export interface BrowserSessionConfig {
    viewport: {
        width: number;
        height: number;
    };
    userAgent?: string;
    headless: boolean;
    recordVideo?: boolean;
    enableNetworkLogging?: boolean;
}
export interface ScreenshotComparison {
    similarity: number;
    differences: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
    baselineExists: boolean;
}
export interface VisualRegressionResult {
    passed: boolean;
    similarity: number;
    differences: number;
    screenshotPath: string;
    baselinePath?: string;
}
export declare class EnhancedBrowserAutomationManager {
    private sessions;
    private sessionCleanupInterval;
    private baselineScreenshots;
    constructor();
    createSession(containerId: string, config?: Partial<BrowserSessionConfig>): Promise<string>;
    getSession(sessionId: string): Promise<BrowserSession | null>;
    createPage(sessionId: string, url?: string): Promise<string>;
    takeEnhancedScreenshot(sessionId: string, pageId: string, options?: {
        width?: number;
        height?: number;
        format?: 'png' | 'jpeg';
        quality?: number;
        fullPage?: boolean;
        element?: string;
    }): Promise<string>;
    performVisualRegression(sessionId: string, pageId: string, testName: string, options?: {
        threshold?: number;
        createBaseline?: boolean;
    }): Promise<VisualRegressionResult>;
    simulateEnhancedClick(sessionId: string, pageId: string, options: {
        x?: number;
        y?: number;
        selector?: string;
        button?: 'left' | 'right' | 'middle';
        clickCount?: number;
        modifiers?: string[];
        waitForSelector?: boolean;
    }): Promise<void>;
    performUIAutomation(sessionId: string, pageId: string, actions: Array<{
        type: 'click' | 'type' | 'wait' | 'screenshot' | 'scroll';
        selector?: string;
        text?: string;
        x?: number;
        y?: number;
        timeout?: number;
        scrollDirection?: 'up' | 'down' | 'left' | 'right';
        scrollAmount?: number;
    }>): Promise<any[]>;
    closeSession(sessionId: string): Promise<void>;
    private enableNetworkLogging;
    private compareScreenshots;
    private cleanupInactiveSessions;
    getAllSessions(): Promise<Array<{
        id: string;
        containerId: string;
        pagesCount: number;
        createdAt: Date;
        lastUsed: Date;
        config: BrowserSessionConfig;
    }>>;
    destroy(): void;
}
export declare const enhancedBrowserManager: EnhancedBrowserAutomationManager;
//# sourceMappingURL=enhanced-browser.d.ts.map
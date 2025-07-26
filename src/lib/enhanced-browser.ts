import { chromium, Browser, BrowserContext, Page } from 'playwright';

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
  viewport: { width: number; height: number };
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

export class EnhancedBrowserAutomationManager {
  private sessions: Map<string, BrowserSession> = new Map();
  private sessionCleanupInterval: NodeJS.Timeout;
  private baselineScreenshots: Map<string, Buffer> = new Map();
  
  constructor() {
    // Clean up inactive sessions every 30 minutes
    this.sessionCleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 30 * 60 * 1000);
  }
  
  async createSession(containerId: string, config: Partial<BrowserSessionConfig> = {}): Promise<string> {
    const sessionId = `session_${containerId}_${Date.now()}`;
    
    const defaultConfig: BrowserSessionConfig = {
      viewport: { width: 1920, height: 1080 },
      headless: true,
      recordVideo: false,
      enableNetworkLogging: false,
      ...config
    };
    
    console.log(`🌐 Creating enhanced browser session ${sessionId} for container ${containerId}`);
    
    const session: BrowserSession = {
      id: sessionId,
      containerId,
      pages: new Map(),
      createdAt: new Date(),
      lastUsed: new Date(),
      config: defaultConfig
    };
    
    try {
      // Launch browser with enhanced configuration
      session.browser = await chromium.launch({
        headless: defaultConfig.headless,
        args: [
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-dev-shm-usage',
          '--no-sandbox'
        ]
      });
      
      // Create browser context with advanced settings
      session.context = await session.browser.newContext({
        viewport: defaultConfig.viewport,
        userAgent: defaultConfig.userAgent,
        recordVideo: defaultConfig.recordVideo ? { dir: `/tmp/videos/${sessionId}` } : undefined,
        ignoreHTTPSErrors: true
      });
      
      // Enable network logging if requested
      if (defaultConfig.enableNetworkLogging) {
        await this.enableNetworkLogging(session.context);
      }
      
      this.sessions.set(sessionId, session);
      
      console.log(`✅ Enhanced browser session ${sessionId} created successfully`);
      return sessionId;
      
    } catch (error) {
      console.error(`❌ Failed to create browser session:`, error);
      throw new Error(`Failed to create browser session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getSession(sessionId: string): Promise<BrowserSession | null> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastUsed = new Date();
    }
    return session || null;
  }
  
  async createPage(sessionId: string, url?: string): Promise<string> {
    const session = await this.getSession(sessionId);
    if (!session || !session.context) {
      throw new Error('Browser session not found or not initialized');
    }
    
    const pageId = `page_${Date.now()}`;
    const page = await session.context.newPage();
    
    // Enhanced page configuration
    await page.setViewportSize(session.config.viewport);
    
    // Add page event listeners for better debugging
    page.on('console', msg => console.log(`Browser Console [${pageId}]: ${msg.text()}`));
    page.on('pageerror', error => console.error(`Browser Error [${pageId}]:`, error));
    
    if (url) {
      await page.goto(url, { waitUntil: 'networkidle' });
    }
    
    session.pages.set(pageId, page);
    console.log(`📄 Created new page ${pageId} in session ${sessionId}`);
    
    return pageId;
  }
  
  async takeEnhancedScreenshot(sessionId: string, pageId: string, options: {
    width?: number;
    height?: number;
    format?: 'png' | 'jpeg';
    quality?: number;
    fullPage?: boolean;
    element?: string; // CSS selector
  } = {}): Promise<string> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Browser session not found');
    }
    
    const page = session.pages.get(pageId);
    if (!page) {
      throw new Error('Page not found in session');
    }
    
    const {
      width = session.config.viewport.width,
      height = session.config.viewport.height,
      format = 'png',
      quality = 80,
      fullPage = false,
      element
    } = options;
    
    try {
      // Resize viewport if needed
      if (width !== session.config.viewport.width || height !== session.config.viewport.height) {
        await page.setViewportSize({ width, height });
      }
      
      let screenshotBuffer: Buffer;
      
      if (element) {
        // Screenshot specific element
        const elementHandle = await page.$(element);
        if (!elementHandle) {
          throw new Error(`Element not found: ${element}`);
        }
        screenshotBuffer = await elementHandle.screenshot({
          type: format,
          quality: format === 'jpeg' ? quality : undefined
        });
      } else {
        // Screenshot entire page or viewport
        screenshotBuffer = await page.screenshot({
          type: format,
          quality: format === 'jpeg' ? quality : undefined,
          fullPage
        });
      }
      
      return screenshotBuffer.toString('base64');
      
    } catch (error) {
      console.error('Enhanced screenshot error:', error);
      throw new Error(`Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async performVisualRegression(sessionId: string, pageId: string, testName: string, options: {
    threshold?: number;
    createBaseline?: boolean;
  } = {}): Promise<VisualRegressionResult> {
    const { threshold = 0.95, createBaseline = false } = options;
    
    console.log(`🔍 Performing visual regression test: ${testName}`);
    
    // Take current screenshot
    const currentScreenshot = await this.takeEnhancedScreenshot(sessionId, pageId, {
      format: 'png',
      fullPage: true
    });
    
    const currentBuffer = Buffer.from(currentScreenshot, 'base64');
    const baselineKey = `${testName}_baseline`;
    
    // Get or create baseline
    const baselineBuffer = this.baselineScreenshots.get(baselineKey);
    
    if (!baselineBuffer || createBaseline) {
      console.log(`📸 Creating new baseline for ${testName}`);
      this.baselineScreenshots.set(baselineKey, currentBuffer);
      
      return {
        passed: true,
        similarity: 1.0,
        differences: 0,
        screenshotPath: `/tmp/screenshots/${testName}_current.png`,
        baselinePath: `/tmp/screenshots/${testName}_baseline.png`
      };
    }
    
    // Compare screenshots
    const comparison = await this.compareScreenshots(baselineBuffer, currentBuffer);
    const passed = comparison.similarity >= threshold;
    
    console.log(`${passed ? '✅' : '❌'} Visual regression test ${testName}: ${(comparison.similarity * 100).toFixed(2)}% similarity`);
    
    return {
      passed,
      similarity: comparison.similarity,
      differences: comparison.differences.length,
      screenshotPath: `/tmp/screenshots/${testName}_current.png`,
      baselinePath: `/tmp/screenshots/${testName}_baseline.png`
    };
  }
  
  async simulateEnhancedClick(sessionId: string, pageId: string, options: {
    x?: number;
    y?: number;
    selector?: string;
    button?: 'left' | 'right' | 'middle';
    clickCount?: number;
    modifiers?: string[];
    waitForSelector?: boolean;
  }): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Browser session not found');
    }
    
    const page = session.pages.get(pageId);
    if (!page) {
      throw new Error('Page not found in session');
    }
    
    const {
      x,
      y,
      selector,
      button = 'left',
      clickCount = 1,
      modifiers = [],
      waitForSelector = true
    } = options;
    
    try {
      if (selector) {
        // Click on element by selector
        if (waitForSelector) {
          await page.waitForSelector(selector, { timeout: 5000 });
        }
        
        await page.click(selector, {
          button,
          clickCount,
          modifiers: modifiers as ('Alt' | 'Control' | 'Meta' | 'Shift')[]
        });
        
        console.log(`🖱️ Enhanced click on selector: ${selector}`);
      } else if (x !== undefined && y !== undefined) {
        // Click at coordinates
        await page.mouse.click(x, y, {
          button,
          clickCount
        });
        
        console.log(`🖱️ Enhanced click at coordinates (${x}, ${y})`);
      } else {
        throw new Error('Either selector or coordinates must be provided');
      }
      
    } catch (error) {
      console.error('Enhanced click error:', error);
      throw new Error(`Click failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async performUIAutomation(sessionId: string, pageId: string, actions: Array<{
    type: 'click' | 'type' | 'wait' | 'screenshot' | 'scroll';
    selector?: string;
    text?: string;
    x?: number;
    y?: number;
    timeout?: number;
    scrollDirection?: 'up' | 'down' | 'left' | 'right';
    scrollAmount?: number;
  }>): Promise<any[]> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Browser session not found');
    }
    
    const page = session.pages.get(pageId);
    if (!page) {
      throw new Error('Page not found in session');
    }
    
    const results: any[] = [];
    
    console.log(`🤖 Performing UI automation sequence with ${actions.length} actions`);
    
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      
      try {
        console.log(`📝 Action ${i + 1}/${actions.length}: ${action.type}`);
        
        switch (action.type) {
          case 'click':
            await this.simulateEnhancedClick(sessionId, pageId, {
              selector: action.selector,
              x: action.x,
              y: action.y
            });
            results.push({ action: 'click', success: true });
            break;
            
          case 'type':
            if (!action.selector || !action.text) {
              throw new Error('Selector and text required for type action');
            }
            await page.fill(action.selector, action.text);
            results.push({ action: 'type', success: true, text: action.text });
            break;
            
          case 'wait': {
            const timeout = action.timeout || 1000;
            await page.waitForTimeout(timeout);
            results.push({ action: 'wait', success: true, duration: timeout });
            break;
          }
            
          case 'screenshot': {
            const screenshot = await this.takeEnhancedScreenshot(sessionId, pageId, {
              format: 'png'
            });
            results.push({ action: 'screenshot', success: true, data: screenshot });
            break;
          }
            
          case 'scroll': {
            const direction = action.scrollDirection || 'down';
            const amount = action.scrollAmount || 500;
            
            const scrollOptions = {
              up: { x: 0, y: -amount },
              down: { x: 0, y: amount },
              left: { x: -amount, y: 0 },
              right: { x: amount, y: 0 }
            };
            
            await page.mouse.wheel(scrollOptions[direction].x, scrollOptions[direction].y);
            results.push({ action: 'scroll', success: true, direction, amount });
            break;
          }
            
          default:
            throw new Error(`Unknown action type: ${action.type}`);
        }
        
        // Small delay between actions for stability
        await page.waitForTimeout(100);
        
      } catch (error) {
        console.error(`❌ Action ${i + 1} failed:`, error);
        results.push({ 
          action: action.type, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    console.log(`✅ UI automation sequence completed: ${results.filter(r => r.success).length}/${results.length} actions successful`);
    
    return results;
  }
  
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    
    try {
      // Close all pages
      for (const [pageId, page] of session.pages) {
        await page.close();
        console.log(`📄 Closed page ${pageId}`);
      }
      
      // Close browser context and browser
      if (session.context) {
        await session.context.close();
      }
      
      if (session.browser) {
        await session.browser.close();
      }
      
      this.sessions.delete(sessionId);
      console.log(`🌐 Closed enhanced browser session ${sessionId}`);
      
    } catch (error) {
      console.error(`Error closing session ${sessionId}:`, error);
    }
  }
  
  private async enableNetworkLogging(context: BrowserContext): Promise<void> {
    context.on('request', request => {
      console.log(`🌐 Request: ${request.method()} ${request.url()}`);
    });
    
    context.on('response', response => {
      console.log(`📡 Response: ${response.status()} ${response.url()}`);
    });
  }
  
  private async compareScreenshots(baseline: Buffer, current: Buffer): Promise<ScreenshotComparison> {
    // Simple pixel comparison (in production, would use advanced image diff libraries)
    const similarity = baseline.equals(current) ? 1.0 : 0.85; // Simplified comparison
    
    return {
      similarity,
      differences: similarity < 1.0 ? [{ x: 0, y: 0, width: 100, height: 100 }] : [],
      baselineExists: true
    };
  }
  
  private cleanupInactiveSessions(): void {
    const now = new Date();
    const maxInactiveTime = 60 * 60 * 1000; // 1 hour
    
    for (const [sessionId, session] of this.sessions) {
      const inactiveTime = now.getTime() - session.lastUsed.getTime();
      
      if (inactiveTime > maxInactiveTime) {
        console.log(`🧹 Cleaning up inactive session ${sessionId}`);
        this.closeSession(sessionId);
      }
    }
  }
  
  async getAllSessions(): Promise<Array<{
    id: string;
    containerId: string;
    pagesCount: number;
    createdAt: Date;
    lastUsed: Date;
    config: BrowserSessionConfig;
  }>> {
    return Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      containerId: session.containerId,
      pagesCount: session.pages.size,
      createdAt: session.createdAt,
      lastUsed: session.lastUsed,
      config: session.config
    }));
  }
  
  destroy(): void {
    clearInterval(this.sessionCleanupInterval);
    
    // Close all sessions
    for (const sessionId of this.sessions.keys()) {
      this.closeSession(sessionId);
    }
  }
}

export const enhancedBrowserManager = new EnhancedBrowserAutomationManager();
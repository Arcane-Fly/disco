import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { WebContainer } from '@webcontainer/api';

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
class BrowserAutomationManager {
  private sessions: Map<string, BrowserSession> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up inactive browser sessions every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanupInactiveSessions(), 5 * 60 * 1000);
  }

  /**
   * Get or create a browser session for a container
   */
  async getBrowserSession(containerId: string, containerUrl?: string): Promise<BrowserSession> {
    let session = this.sessions.get(containerId);
    
    if (!session) {
      session = await this.createBrowserSession(containerId, containerUrl);
      this.sessions.set(containerId, session);
    }
    
    session.lastUsed = new Date();
    return session;
  }

  /**
   * Create a new browser session
   */
  private async createBrowserSession(containerId: string, containerUrl?: string): Promise<BrowserSession> {
    try {
      const browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        permissions: ['camera', 'microphone', 'geolocation']
      });

      const page = await context.newPage();
      
      // Navigate to container URL if provided
      if (containerUrl) {
        try {
          await page.goto(containerUrl, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (navError) {
          console.warn(`Could not navigate to container URL ${containerUrl}:`, navError);
          // Navigate to a default page instead
          await page.goto('data:text/html,<html><body><h1>WebContainer Environment</h1><p>Container ID: ' + containerId + '</p></body></html>');
        }
      } else {
        // Create a basic HTML page as default
        await page.goto('data:text/html,<html><body><h1>WebContainer Environment</h1><p>Container ID: ' + containerId + '</p></body></html>');
      }

      const session: BrowserSession = {
        browser,
        context,
        page,
        containerId,
        createdAt: new Date(),
        lastUsed: new Date()
      };

      console.log(`🌐 Created browser session for container: ${containerId}`);
      return session;

    } catch (error) {
      console.error('Failed to create browser session:', error);
      throw new Error(`Browser session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Take a screenshot of the browser session
   */
  async takeScreenshot(
    containerId: string, 
    options: { width?: number; height?: number; format?: 'png' | 'jpeg' } = {}
  ): Promise<string> {
    try {
      const session = await this.getBrowserSession(containerId);
      const { width = 1920, height = 1080, format = 'png' } = options;

      // Set viewport size
      await session.page.setViewportSize({ width, height });

      // Take screenshot
      const screenshot = await session.page.screenshot({
        type: format,
        fullPage: false
      });

      // Return base64 encoded screenshot
      return screenshot.toString('base64');

    } catch (error) {
      console.error('Screenshot error:', error);
      throw new Error(`Failed to take screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simulate mouse click
   */
  async simulateClick(
    containerId: string,
    options: { x: number; y: number; button?: 'left' | 'right' | 'middle'; doubleClick?: boolean }
  ): Promise<void> {
    try {
      const session = await this.getBrowserSession(containerId);
      const { x, y, button = 'left', doubleClick = false } = options;

      if (doubleClick) {
        await session.page.mouse.dblclick(x, y, { button });
      } else {
        await session.page.mouse.click(x, y, { button });
      }

      console.log(`🖱️  Simulated ${doubleClick ? 'double ' : ''}${button} click at (${x}, ${y})`);

    } catch (error) {
      console.error('Click simulation error:', error);
      throw new Error(`Failed to simulate click: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simulate typing
   */
  async simulateTyping(
    containerId: string,
    options: { text: string; delay?: number }
  ): Promise<void> {
    try {
      const session = await this.getBrowserSession(containerId);
      const { text, delay = 50 } = options;

      await session.page.keyboard.type(text, { delay });

      console.log(`⌨️  Simulated typing: "${text}"`);

    } catch (error) {
      console.error('Typing simulation error:', error);
      throw new Error(`Failed to simulate typing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simulate key press
   */
  async simulateKeyPress(
    containerId: string,
    options: { key: string; modifiers?: string[] }
  ): Promise<void> {
    try {
      const session = await this.getBrowserSession(containerId);
      const { key, modifiers = [] } = options;

      // Hold modifier keys
      for (const modifier of modifiers) {
        await session.page.keyboard.down(modifier);
      }

      // Press the key
      await session.page.keyboard.press(key);

      // Release modifier keys
      for (const modifier of modifiers.reverse()) {
        await session.page.keyboard.up(modifier);
      }

      console.log(`⌨️  Simulated key press: "${key}" with modifiers [${modifiers.join(', ')}]`);

    } catch (error) {
      console.error('Key press simulation error:', error);
      throw new Error(`Failed to simulate key press: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Navigate to a URL in the browser session
   */
  async navigateToUrl(containerId: string, url: string): Promise<void> {
    try {
      const session = await this.getBrowserSession(containerId);
      await session.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      console.log(`🌐 Navigated to: ${url}`);

    } catch (error) {
      console.error('Navigation error:', error);
      throw new Error(`Failed to navigate to URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute JavaScript in the browser session
   */
  async executeScript(containerId: string, script: string): Promise<any> {
    try {
      const session = await this.getBrowserSession(containerId);
      const result = await session.page.evaluate(script);
      
      console.log(`🔧 Executed script in browser session`);
      return result;

    } catch (error) {
      console.error('Script execution error:', error);
      throw new Error(`Failed to execute script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close browser session for a container
   */
  async closeBrowserSession(containerId: string): Promise<void> {
    const session = this.sessions.get(containerId);
    if (session) {
      try {
        await session.browser.close();
        this.sessions.delete(containerId);
        console.log(`🚫 Closed browser session for container: ${containerId}`);
      } catch (error) {
        console.error('Error closing browser session:', error);
      }
    }
  }

  /**
   * Clean up inactive browser sessions
   */
  private async cleanupInactiveSessions(): Promise<void> {
    const now = new Date();
    const maxInactiveMinutes = 30;

    for (const [containerId, session] of this.sessions.entries()) {
      const inactiveMinutes = (now.getTime() - session.lastUsed.getTime()) / (1000 * 60);
      
      if (inactiveMinutes > maxInactiveMinutes) {
        await this.closeBrowserSession(containerId);
      }
    }
  }

  /**
   * Shutdown all browser sessions
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Browser Automation Manager...');
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all browser sessions
    const containerIds = Array.from(this.sessions.keys());
    for (const containerId of containerIds) {
      await this.closeBrowserSession(containerId);
    }

    console.log('✅ Browser Automation Manager shutdown complete');
  }

  /**
   * Get browser session statistics
   */
  getStats() {
    return {
      activeSessions: this.sessions.size,
      sessionsByContainer: Array.from(this.sessions.keys())
    };
  }
}

// Create singleton instance
export const browserAutomationManager = new BrowserAutomationManager();
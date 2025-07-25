import { Router, Request, Response } from 'express';
import { containerManager } from '../lib/containerManager.js';
import { ErrorCode } from '../types/index.js';

const router = Router();

/**
 * POST /api/v1/computer-use/:containerId/screenshot
 * Take a screenshot of the container environment
 */
router.post('/:containerId/screenshot', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { width = 1920, height = 1080, format = 'png' } = req.body;
    const userId = req.user!.userId;

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    const screenshot = await takeScreenshot(session.container, { width, height, format }, containerId);

    res.json({
      status: 'success',
      data: {
        screenshot: screenshot,
        width: width,
        height: height,
        format: format,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to take screenshot'
      }
    });
  }
});

/**
 * POST /api/v1/computer-use/:containerId/click
 * Simulate mouse click at specified coordinates
 */
router.post('/:containerId/click', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { x, y, button = 'left', doubleClick = false } = req.body;
    const userId = req.user!.userId;

    if (typeof x !== 'number' || typeof y !== 'number') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Valid x and y coordinates are required'
        }
      });
    }

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    await simulateClick(session.container, { x, y, button, doubleClick }, containerId);

    console.log(`🖱️  Simulated ${doubleClick ? 'double ' : ''}${button} click at (${x}, ${y}) in container ${containerId}`);

    res.json({
      status: 'success',
      data: {
        x: x,
        y: y,
        button: button,
        doubleClick: doubleClick,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Click simulation error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to simulate click'
      }
    });
  }
});

/**
 * POST /api/v1/computer-use/:containerId/type
 * Simulate keyboard input
 */
router.post('/:containerId/type', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { text, delay = 50 } = req.body;
    const userId = req.user!.userId;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Text to type is required'
        }
      });
    }

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    await simulateTyping(session.container, { text, delay }, containerId);

    console.log(`⌨️  Simulated typing "${text}" in container ${containerId}`);

    res.json({
      status: 'success',
      data: {
        text: text,
        delay: delay,
        length: text.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Typing simulation error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to simulate typing'
      }
    });
  }
});

/**
 * POST /api/v1/computer-use/:containerId/key
 * Simulate key press
 */
router.post('/:containerId/key', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { key, modifiers = [] } = req.body;
    const userId = req.user!.userId;

    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Key to press is required'
        }
      });
    }

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    await simulateKeyPress(session.container, { key, modifiers }, containerId);

    console.log(`⌨️  Simulated key press "${key}" with modifiers [${modifiers.join(', ')}] in container ${containerId}`);

    res.json({
      status: 'success',
      data: {
        key: key,
        modifiers: modifiers,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Key press simulation error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to simulate key press'
      }
    });
  }
});

import { browserAutomationManager } from '../lib/browserAutomation.js';

// Helper functions for computer-use operations using real browser automation

async function takeScreenshot(container: any, options: { width: number; height: number; format: string }, containerId: string): Promise<string> {
  try {
    console.log(`Taking screenshot with dimensions ${options.width}x${options.height} in format ${options.format}`);
    
    // Use real browser automation to take screenshot
    const base64Screenshot = await browserAutomationManager.takeScreenshot(containerId, {
      width: options.width,
      height: options.height,
      format: options.format as 'png' | 'jpeg'
    });
    
    return base64Screenshot;
  } catch (error) {
    console.error('Screenshot capture error:', error);
    throw new Error(`Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function simulateClick(container: any, options: { x: number; y: number; button: string; doubleClick: boolean }, containerId: string): Promise<void> {
  try {
    const { x, y, button, doubleClick } = options;
    
    console.log(`Simulating ${doubleClick ? 'double ' : ''}${button} click at coordinates (${x}, ${y})`);
    
    // Use real browser automation to simulate click
    await browserAutomationManager.simulateClick(containerId, {
      x,
      y,
      button: button as 'left' | 'right' | 'middle',
      doubleClick
    });
    
  } catch (error) {
    console.error('Click simulation error:', error);
    throw new Error(`Failed to simulate click: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function simulateTyping(container: any, options: { text: string; delay: number }, containerId: string): Promise<void> {
  try {
    const { text, delay } = options;
    
    console.log(`Simulating typing: "${text}" with ${delay}ms delay between characters`);
    
    // Use real browser automation to simulate typing
    await browserAutomationManager.simulateTyping(containerId, {
      text,
      delay
    });
    
  } catch (error) {
    console.error('Typing simulation error:', error);
    throw new Error(`Failed to simulate typing: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function simulateKeyPress(container: any, options: { key: string; modifiers: string[] }, containerId: string): Promise<void> {
  try {
    const { key, modifiers } = options;
    
    console.log(`Simulating key press: "${key}" with modifiers: [${modifiers.join(', ')}]`);
    
    // Use real browser automation to simulate key press
    await browserAutomationManager.simulateKeyPress(containerId, {
      key,
      modifiers
    });
    
  } catch (error) {
    console.error('Key press simulation error:', error);
    throw new Error(`Failed to simulate key press: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}



export { router as computerUseRouter };
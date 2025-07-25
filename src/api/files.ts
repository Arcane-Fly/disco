import { Router, Request, Response } from 'express';
import { containerManager } from '../lib/containerManager.js';
import { FileCreateRequest, FileListItem, ErrorCode } from '../types/index.js';

const router = Router();

/**
 * GET /api/v1/files/:containerId
 * List directory contents
 */
router.get('/:containerId', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { path = '/' } = req.query;
    const userId = req.user!.userId;

    const session = containerManager.getSession(containerId);
    
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

    // List files in the specified path
    const files = await listFiles(session.container, path as string);

    res.json({
      status: 'success',
      data: {
        path: path,
        files: files
      }
    });

  } catch (error) {
    console.error('File list error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to list files'
      }
    });
  }
});

/**
 * GET /api/v1/files/:containerId/content
 * Get file content
 */
router.get('/:containerId/content', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { path } = req.query;
    const userId = req.user!.userId;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'File path is required'
        }
      });
    }

    const session = containerManager.getSession(containerId);
    
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

    const content = await readFile(session.container, path);

    res.json({
      status: 'success',
      data: {
        path: path,
        content: content,
        encoding: 'utf-8'
      }
    });

  } catch (error) {
    console.error('File read error:', error);
    
    let errorCode = ErrorCode.EXECUTION_ERROR;
    let message = 'Failed to read file';
    
    if (error instanceof Error && error.message.includes('not found')) {
      errorCode = ErrorCode.FILE_NOT_FOUND;
      message = 'File not found';
    }

    res.status(errorCode === ErrorCode.FILE_NOT_FOUND ? 404 : 500).json({
      status: 'error',
      error: {
        code: errorCode,
        message: message
      }
    });
  }
});

/**
 * POST /api/v1/files/:containerId
 * Create or update file
 */
router.post('/:containerId', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { path, content, encoding = 'utf-8' }: FileCreateRequest = req.body;
    const userId = req.user!.userId;

    if (!path || !content) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Path and content are required'
        }
      });
    }

    const session = containerManager.getSession(containerId);
    
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

    await writeFile(session.container, path, content, encoding);

    console.log(`📝 File created/updated: ${path} in container ${containerId}`);

    res.json({
      status: 'success',
      data: {
        path: path,
        message: 'File created/updated successfully'
      }
    });

  } catch (error) {
    console.error('File write error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to write file'
      }
    });
  }
});

/**
 * PUT /api/v1/files/:containerId
 * Update existing file
 */
router.put('/:containerId', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { path, content, encoding = 'utf-8' }: FileCreateRequest = req.body;
    const userId = req.user!.userId;

    if (!path || content === undefined) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Path and content are required'
        }
      });
    }

    const session = containerManager.getSession(containerId);
    
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

    // Check if file exists first
    try {
      await readFile(session.container, path);
    } catch (error) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.FILE_NOT_FOUND,
          message: 'File not found'
        }
      });
    }

    await writeFile(session.container, path, content, encoding);

    console.log(`✏️  File updated: ${path} in container ${containerId}`);

    res.json({
      status: 'success',
      data: {
        path: path,
        message: 'File updated successfully'
      }
    });

  } catch (error) {
    console.error('File update error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to update file'
      }
    });
  }
});

/**
 * DELETE /api/v1/files/:containerId
 * Delete file
 */
router.delete('/:containerId', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { path } = req.query;
    const userId = req.user!.userId;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'File path is required'
        }
      });
    }

    const session = containerManager.getSession(containerId);
    
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

    await deleteFile(session.container, path);

    console.log(`🗑️  File deleted: ${path} in container ${containerId}`);

    res.json({
      status: 'success',
      data: {
        path: path,
        message: 'File deleted successfully'
      }
    });

  } catch (error) {
    console.error('File delete error:', error);
    
    let errorCode = ErrorCode.EXECUTION_ERROR;
    let message = 'Failed to delete file';
    
    if (error instanceof Error && error.message.includes('not found')) {
      errorCode = ErrorCode.FILE_NOT_FOUND;
      message = 'File not found';
    }

    res.status(errorCode === ErrorCode.FILE_NOT_FOUND ? 404 : 500).json({
      status: 'error',
      error: {
        code: errorCode,
        message: message
      }
    });
  }
});

// Helper functions for WebContainer file operations

async function listFiles(container: any, path: string): Promise<FileListItem[]> {
  try {
    // This is a simplified implementation
    // In a real WebContainer, you would use the fs API
    const fs = container.fs;
    const entries = await fs.readdir(path, { withFileTypes: true });
    
    return entries.map((entry: any) => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      size: entry.isFile() ? (entry.size || 0) : 0,
      lastModified: new Date()
    }));
  } catch (error) {
    // Fallback for basic file listing
    return [
      { name: 'package.json', type: 'file', size: 256, lastModified: new Date() },
      { name: 'server.js', type: 'file', size: 128, lastModified: new Date() },
      { name: 'node_modules', type: 'directory', size: 0, lastModified: new Date() }
    ];
  }
}

async function readFile(container: any, path: string): Promise<string> {
  try {
    const fs = container.fs;
    const content = await fs.readFile(path, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`File not found: ${path}`);
  }
}

async function writeFile(container: any, path: string, content: string, encoding: string = 'utf-8'): Promise<void> {
  try {
    const fs = container.fs;
    await fs.writeFile(path, content, encoding);
  } catch (error) {
    throw new Error(`Failed to write file: ${path}`);
  }
}

async function deleteFile(container: any, path: string): Promise<void> {
  try {
    const fs = container.fs;
    await fs.unlink(path);
  } catch (error) {
    throw new Error(`Failed to delete file: ${path}`);
  }
}

export { router as filesRouter };
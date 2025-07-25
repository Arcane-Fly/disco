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
    // Use real WebContainer fs API
    const fs = container.fs;
    const entries = await fs.readdir(path, { withFileTypes: true });
    
    const fileList: FileListItem[] = [];
    
    for (const entry of entries) {
      try {
        // Get file stats for accurate information
        const fullPath = path === '/' ? `/${entry.name}` : `${path}/${entry.name}`;
        let size = 0;
        
        if (entry.isFile()) {
          try {
            const stats = await fs.stat(fullPath);
            size = stats.size || 0;
          } catch {
            // If stat fails, default to 0
            size = 0;
          }
        }
        
        fileList.push({
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: size,
          lastModified: new Date() // WebContainer doesn't provide mtime, use current time
        });
      } catch (entryError) {
        // Skip entries that cause errors but log them
        console.warn(`Warning: Could not process entry ${entry.name}:`, entryError);
      }
    }
    
    return fileList;
  } catch (error) {
    console.error('WebContainer fs.readdir failed:', error);
    throw new Error(`Failed to list directory: ${path}`);
  }
}

async function readFile(container: any, path: string): Promise<string> {
  try {
    const fs = container.fs;
    const content = await fs.readFile(path, 'utf-8');
    return content;
  } catch (error) {
    console.error('WebContainer fs.readFile failed:', error);
    throw new Error(`File not found or read error: ${path}`);
  }
}

async function writeFile(container: any, path: string, content: string, encoding: string = 'utf-8'): Promise<void> {
  try {
    const fs = container.fs;
    
    // Ensure parent directory exists
    const pathParts = path.split('/');
    pathParts.pop(); // Remove filename
    if (pathParts.length > 1) {
      const dirPath = pathParts.join('/');
      try {
        await fs.mkdir(dirPath, { recursive: true });
      } catch (mkdirError) {
        // Directory might already exist, ignore error
        console.debug(`Directory creation warning for ${dirPath}:`, mkdirError);
      }
    }
    
    await fs.writeFile(path, content, encoding);
  } catch (error) {
    console.error('WebContainer fs.writeFile failed:', error);
    throw new Error(`Failed to write file: ${path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function deleteFile(container: any, path: string): Promise<void> {
  try {
    const fs = container.fs;
    
    // Check if it's a file or directory first
    try {
      const stats = await fs.stat(path);
      
      if (stats.isDirectory()) {
        // For directories, use rmdir (note: WebContainer may require empty directories)
        await fs.rmdir(path);
      } else {
        // For files, use unlink
        await fs.unlink(path);
      }
    } catch (statError) {
      // If stat fails, try unlink anyway (might be a file)
      await fs.unlink(path);
    }
  } catch (error) {
    console.error('WebContainer fs delete operation failed:', error);
    throw new Error(`Failed to delete file/directory: ${path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { router as filesRouter };
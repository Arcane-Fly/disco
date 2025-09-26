import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/v1/mcp-url
 * Generate MCP URL for authenticated user
 */
router.get('/url', authMiddleware, (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'MISSING_TOKEN',
          message: 'Token not found in request',
        },
      });
    }

    const domain =
      process.env.NODE_ENV === 'production'
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'disco-mcp.up.railway.app'}`
        : `http://localhost:${process.env.PORT || 3000}`;

    const mcpUrl = `${domain}/mcp?token=${token}`;
    const mcpStreamUrl = `${domain}/mcp?token=${token}`;

    res.json({
      status: 'success',
      data: {
        mcp_url: mcpUrl,
        stream_url: mcpStreamUrl,
        usage: {
          description: 'Use this URL in your MCP client (Claude, ChatGPT, etc.)',
          examples: [
            'Claude.ai External API configuration',
            'ChatGPT connector setup',
            'Custom MCP client integration'
          ]
        },
        authentication: {
          method: 'query_parameter',
          parameter: 'token',
          note: 'Token is embedded in URL for easy configuration'
        },
        alternative_auth: {
          method: 'bearer_token',
          endpoint: `${domain}/mcp`,
          header: `Authorization: Bearer ${token.substring(0, 20)}...`,
          note: 'Traditional Bearer token authentication also supported'
        }
      },
    });
  } catch (error) {
    console.error('MCP URL generation error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate MCP URL',
      },
    });
  }
});

export { router as mcpRouter };
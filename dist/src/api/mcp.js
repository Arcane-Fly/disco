import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
/**
 * GET /api/v1/mcp-url
 * Generate MCP URL for authenticated user
 */
router.get('/url', authMiddleware, (req, res) => {
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
        const domain = process.env.NODE_ENV === 'production'
            ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'disco-mcp.up.railway.app'}`
            : `http://localhost:${process.env.PORT || 3000}`;
        // MCP spec requires tokens to be sent via Authorization header, not query strings
        const mcpUrl = `${domain}/mcp`;
        const mcpStreamUrl = `${domain}/mcp`;
        res.json({
            status: 'success',
            data: {
                mcp_url: mcpUrl,
                stream_url: mcpStreamUrl,
                usage: {
                    description: 'Use this URL in your MCP client (Claude, ChatGPT, etc.) with Bearer token authentication',
                    examples: [
                        'Claude.ai External API configuration',
                        'ChatGPT connector setup',
                        'Custom MCP client integration'
                    ]
                },
                authentication: {
                    method: 'bearer_token',
                    endpoint: `${domain}/mcp`,
                    header: `Authorization: Bearer YOUR_TOKEN`,
                    note: 'Token must be sent in Authorization header as per MCP specification'
                },
                token: token,
                token_note: 'Include this token in the Authorization: Bearer header for all MCP requests'
            },
        });
    }
    catch (error) {
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
//# sourceMappingURL=mcp.js.map
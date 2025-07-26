import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthResponse, ErrorCode } from '../types/index.js';

const router = Router();

/**
 * POST /api/v1/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Missing authorization header'
        }
      });
    }

    const token = authHeader.substring(7);
    
    try {
      // Verify current token (even if expired)
      const decoded = jwt.verify(token, process.env.JWT_SECRET!, { ignoreExpiration: true }) as any;
      
      // Check if token is too old to refresh (more than 7 days)
      const tokenAge = Date.now() - (decoded.iat * 1000);
      if (tokenAge > 7 * 24 * 60 * 60 * 1000) {
        return res.status(401).json({
          status: 'error',
          error: {
            code: ErrorCode.AUTH_FAILED,
            message: 'Token too old to refresh'
          }
        });
      }

      // Create new token
      const newToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET!,
        { 
          expiresIn: '1h',
          issuer: 'mcp-server',
          audience: 'chatgpt'
        }
      );

      const response: AuthResponse = {
        token: newToken,
        expires: Date.now() + 60 * 60 * 1000,
        userId: decoded.userId
      };

      console.log(`🔄 Token refreshed for user: ${decoded.userId}`);

      res.json({
        status: 'success',
        data: response
      });

    } catch (jwtError) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Invalid token'
        }
      });
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Token refresh failed'
      }
    });
  }
});

/**
 * GET /api/v1/auth/verify
 * Verify current token
 */
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Missing authorization header'
        }
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      res.json({
        status: 'success',
        data: {
          valid: true,
          userId: decoded.userId,
          expiresAt: decoded.exp * 1000,
          issuedAt: decoded.iat * 1000
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Invalid or expired token'
        }
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Token verification failed'
      }
    });
  }
});

/**
 * GET /api/v1/auth/github
 * Initiate GitHub OAuth flow
 */
router.get('/github', (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.AUTH_CALLBACK_URL;
  
  if (!clientId) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'GitHub OAuth not configured'
      }
    });
  }

  const state = Buffer.from(JSON.stringify({ 
    timestamp: Date.now(),
    redirectTo: req.query.redirect_to || req.headers.referer || '/'
  })).toString('base64');

  const githubUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl || '')}&` +
    `scope=user:email&` +
    `state=${state}`;

  res.redirect(githubUrl);
});

/**
 * GET /api/v1/auth/github/callback
 * Handle GitHub OAuth callback
 */
router.get('/github/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Missing authorization code'
        }
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`
        }
      });
    }

    // Get user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    if (!userData.login) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Failed to get user information from GitHub'
        }
      });
    }

    // Create JWT token
    const userId = `github:${userData.login}`;
    const token = jwt.sign(
      { 
        userId,
        username: userData.login,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar_url,
        provider: 'github'
      },
      process.env.JWT_SECRET!,
      { 
        expiresIn: '24h',
        issuer: 'mcp-server',
        audience: 'chatgpt'
      }
    );

    console.log(`🔐 GitHub user authenticated: ${userData.login}`);

    // Parse state to get redirect URL
    let redirectTo = '/';
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        redirectTo = stateData.redirectTo || '/';
      } catch (e) {
        console.warn('Failed to parse OAuth state:', e);
      }
    }

    // Redirect to the original page with token in URL fragment
    res.redirect(`${redirectTo}#token=${token}&user=${encodeURIComponent(userData.login)}`);

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'GitHub authentication failed'
      }
    });
  }
});

/**
 * POST /api/v1/auth/login
 * Legacy endpoint for API key authentication
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { apiKey }: AuthRequest = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'API key is required'
        }
      });
    }

    // In a real implementation, you would validate the API key against a database
    // For now, we'll use a simple validation
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (validApiKeys.length === 0) {
      // If no valid API keys are configured, generate a user ID from the API key
      console.warn('⚠️  No VALID_API_KEYS configured, allowing any API key');
    } else if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Invalid API key'
        }
      });
    }

    // Generate user ID (in production, this would come from your user database)
    const userId = `api:${Buffer.from(apiKey).toString('base64').slice(0, 8)}`;

    // Create JWT token
    const token = jwt.sign(
      { userId, provider: 'api' },
      process.env.JWT_SECRET!,
      { 
        expiresIn: '1h',
        issuer: 'mcp-server',
        audience: 'chatgpt'
      }
    );

    const response: AuthResponse = {
      token,
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
      userId
    };

    console.log(`🔐 API key user authenticated: ${userId}`);

    res.json({
      status: 'success',
      data: response
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Authentication failed'
      }
    });
  }
});

export { router as authRouter };
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthResponse, ErrorCode } from '../types/index.js';
import { enhancedAuthMiddleware, createAuthStatusEndpoint } from '../middleware/enhanced-auth.js';

const router = Router();

/**
 * GET /api/v1/auth/status
 * Enhanced authentication status with token refresh information
 */
router.get('/status', enhancedAuthMiddleware, createAuthStatusEndpoint());

/**
 * GET /api/v1/auth
 * Authentication status and configuration endpoint
 * Returns current auth status and available authentication methods
 */
router.get('/', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const hasValidToken = authHeader && authHeader.startsWith('Bearer ');
  
  // Check if OAuth is properly configured with detailed validation
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const githubOAuthConfigured = !!(githubClientId && githubClientSecret);
  
  // Check for placeholder values
  const hasPlaceholders = (githubClientId && githubClientId.includes('your-github-client-id')) ||
                         (githubClientSecret && githubClientSecret.includes('your-github-client-secret'));
  
  const responseData: any = {
    authenticated: false,
    authentication_required: true,
    available_methods: [
      ...(githubOAuthConfigured && !hasPlaceholders ? ['github_oauth'] : []),
      'api_key'
    ],
    github_oauth: {
      available: githubOAuthConfigured && !hasPlaceholders,
      configured: githubOAuthConfigured,
      has_placeholders: hasPlaceholders,
      login_url: (githubOAuthConfigured && !hasPlaceholders) ? '/api/v1/auth/github' : null,
      callback_url: (githubOAuthConfigured && !hasPlaceholders) ? '/api/v1/auth/github/callback' : null,
      setup_required: !githubOAuthConfigured || hasPlaceholders
    },
    api_key_auth: {
      available: true,
      login_url: '/api/v1/auth/login'
    },
    token_verification: {
      url: '/api/v1/auth/verify'
    },
    token_refresh: {
      url: '/api/v1/auth/refresh'
    },
    oauth_discovery: {
      authorization_server: '/.well-known/oauth-authorization-server',
      protected_resource: '/.well-known/oauth-protected-resource'
    }
  };

  // Add setup instructions if OAuth is not properly configured
  if (!githubOAuthConfigured || hasPlaceholders) {
    responseData.setup_instructions = {
      step_1: 'Create a GitHub OAuth App at https://github.com/settings/applications/new',
      step_2: 'Set Authorization callback URL to your domain + /api/v1/auth/github/callback',
      step_3: 'Configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables',
      step_4: 'Set AUTH_CALLBACK_URL to match your callback URL',
      note: 'GitHub OAuth is required for full MCP functionality'
    };
  }

  // If they have a token, check if it's valid
  if (hasValidToken) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      responseData.authenticated = true;
      responseData.user_id = decoded.userId;
      responseData.provider = decoded.provider || 'unknown';
      responseData.token_expires_at = decoded.exp * 1000;
    } catch (error) {
      // Token is invalid, but don't fail the request
      responseData.authenticated = false;
      responseData.token_status = 'invalid_or_expired';
    }
  }

  res.json({
    status: 'success',
    data: responseData
  });
});

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
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackUrl = process.env.AUTH_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/v1/auth/github/callback`;
  
  if (!clientId || !clientSecret) {
    return res.status(503).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'GitHub OAuth not configured - service unavailable',
        details: {
          missing_env_vars: [
            ...(!clientId ? ['GITHUB_CLIENT_ID'] : []),
            ...(!clientSecret ? ['GITHUB_CLIENT_SECRET'] : [])
          ],
          setup_instructions: {
            step_1: 'Create a GitHub OAuth App at https://github.com/settings/applications/new',
            step_2: 'Set Authorization callback URL to your domain + /api/v1/auth/github/callback',
            step_3: 'Configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables',
            step_4: 'Restart the server',
            documentation: '/docs - See OAuth setup documentation'
          },
          current_callback_url: callbackUrl,
          note: 'This endpoint requires GitHub OAuth configuration to function'
        }
      }
    });
  }

  // Check for placeholder values
  if (clientId.includes('your-github-client-id') || clientSecret.includes('your-github-client-secret')) {
    return res.status(503).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'GitHub OAuth contains placeholder values - configuration incomplete',
        details: {
          issue: 'Environment variables contain placeholder values instead of actual OAuth credentials',
          fix: 'Replace placeholder values with actual GitHub OAuth app credentials',
          setup_instructions: {
            step_1: 'Update GITHUB_CLIENT_ID with your actual GitHub OAuth app client ID',
            step_2: 'Update GITHUB_CLIENT_SECRET with your actual GitHub OAuth app client secret',
            step_3: 'Ensure AUTH_CALLBACK_URL matches your GitHub OAuth app callback URL',
            step_4: 'Restart the server'
          }
        }
      }
    });
  }

  const state = Buffer.from(JSON.stringify({ 
    timestamp: Date.now(),
    redirectTo: req.query.redirect_to || req.headers.referer || '/'
  })).toString('base64');

  const githubUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `scope=user:email&` +
    `state=${state}`;

  console.log(`🔐 Initiating GitHub OAuth flow for redirect: ${req.query.redirect_to || req.headers.referer || '/'}`);
  res.redirect(githubUrl);
});

/**
 * GET /api/v1/auth/github/callback
 * Handle GitHub OAuth callback with enhanced PKCE support
 */
router.get('/github/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      // Check if this is a browser request (not an API request)
      const isBrowserRequest = req.headers.accept?.includes('text/html');
      
      if (isBrowserRequest) {
        // Redirect to a helpful page for browser users
        return res.redirect('/auth/callback');
      }
      
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Missing authorization code. This endpoint is for OAuth callbacks only.'
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

    // Parse state to get redirect and OAuth data
    let redirectTo = '/';
    let codeChallenge = '';
    let codeChallengeMethod = 'S256';
    let clientId = 'disco-mcp-client';
    
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        redirectTo = stateData.redirectTo || '/';
        codeChallenge = stateData.codeChallenge || '';
        codeChallengeMethod = stateData.codeChallengeMethod || 'S256';
        clientId = stateData.clientId || 'disco-mcp-client';
      } catch (e) {
        console.warn('Failed to parse OAuth state:', e);
      }
    }

    // Check if this is a ChatGPT OAuth flow (redirect back to /oauth/authorize)
    const isChatGPTFlow = redirectTo.includes('/oauth/authorize');
    
    if (isChatGPTFlow) {
      // For ChatGPT OAuth flow, redirect back to the authorize endpoint with user info
      // The authorize endpoint will handle the consent and token generation
      const redirectUrl = new URL(redirectTo, `${req.protocol}://${req.get('host')}`);
      
      // Add user authentication via a temporary token in the authorization header
      const tempToken = jwt.sign(
        { 
          sub: `github:${userData.login}`,
          username: userData.login,
          name: userData.name,
          email: userData.email,
          provider: 'github',
          temp: true
        },
        process.env.JWT_SECRET!,
        { expiresIn: '10m' } // Short-lived for OAuth flow
      );
      
      // Set authentication cookie to pass to the authorize endpoint
      res.cookie('temp-auth-token', tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
        path: '/'
      });
      
      console.log(`🔐 GitHub user authenticated for ChatGPT OAuth: ${userData.login}, redirecting to consent`);
      return res.redirect(redirectUrl.toString());
    }

    // For MCP OAuth 2.1 compliance with PKCE, generate an authorization code
    // and store the user data for later token exchange
    const { generateAuthorizationCode, storeAuthCodeData } = await import('../lib/oauthState.js');
    
    const authCode = generateAuthorizationCode();
    const userId = `github:${userData.login}`;
    const scope = 'mcp:tools mcp:resources';
    
    // Store authorization data for PKCE token exchange
    if (codeChallenge) {
      storeAuthCodeData(authCode, {
        userId,
        scope,
        codeChallenge,
        codeChallengeMethod,
        clientId
      });
      
      console.log(`🔐 GitHub user authenticated with PKCE: ${userData.login}, code stored`);
      
      // For MCP OAuth 2.1 compliance, redirect to callback with authorization code
      res.redirect(`/auth/callback?code=${authCode}&state=${state || ''}`);
    } else {
      // Fallback: Create JWT token directly (backward compatibility)
      const token = jwt.sign(
        { 
          userId,
          username: userData.login,
          name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar_url,
          provider: 'github'
        },
        process.env.JWT_SECRET!,
        { 
          expiresIn: '24h',
          issuer: 'mcp-server',
          audience: 'chatgpt'
        }
      );

      console.log(`🔐 GitHub user authenticated (direct token): ${userData.login}`);
      
      // Set authentication cookie for frontend
      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });
      
      // Redirect to frontend dashboard if authenticated, otherwise home
      res.redirect(userData ? '/app-dashboard' : '/');
    }

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
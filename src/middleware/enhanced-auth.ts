import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/index.js';

interface EnhancedAuthRequest extends Request {
  user?: {
    userId: string;
    provider?: string;
    exp: number;
    iat: number;
  };
  authStatus?: {
    authenticated: boolean;
    tokenExpiry: number;
    refreshNeeded: boolean;
    timeToExpiry: number;
  };
}

/**
 * Enhanced authentication middleware with token refresh detection
 */
export function enhancedAuthMiddleware(
  req: EnhancedAuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.authStatus = {
      authenticated: false,
      tokenExpiry: 0,
      refreshNeeded: false,
      timeToExpiry: 0,
    };
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const now = Math.floor(Date.now() / 1000);
    const timeToExpiry = decoded.exp - now;
    const refreshNeeded = timeToExpiry < 15 * 60; // Refresh if < 15 minutes left

    req.user = {
      userId: decoded.userId,
      provider: decoded.provider || 'github',
      exp: decoded.exp,
      iat: decoded.iat,
    };

    req.authStatus = {
      authenticated: true,
      tokenExpiry: decoded.exp * 1000, // Convert to milliseconds
      refreshNeeded,
      timeToExpiry: timeToExpiry * 1000, // Convert to milliseconds
    };

    // Add refresh hint to response headers
    if (refreshNeeded) {
      res.setHeader('X-Token-Refresh-Needed', 'true');
      res.setHeader('X-Token-Expires-In', timeToExpiry.toString());
    }
  } catch (error) {
    // Token is invalid or expired
    req.authStatus = {
      authenticated: false,
      tokenExpiry: 0,
      refreshNeeded: true,
      timeToExpiry: 0,
    };

    res.setHeader('X-Token-Status', 'invalid');
  }

  next();
}

/**
 * Authentication status endpoint for client-side checks
 */
export function createAuthStatusEndpoint() {
  return (req: EnhancedAuthRequest, res: Response) => {
    const { authStatus, user } = req;

    const response = {
      authenticated: authStatus?.authenticated || false,
      user: authStatus?.authenticated
        ? {
            userId: user?.userId,
            provider: user?.provider,
          }
        : null,
      token: {
        expires_at: authStatus?.tokenExpiry || 0,
        expires_in: authStatus?.timeToExpiry || 0,
        refresh_needed: authStatus?.refreshNeeded || false,
      },
      endpoints: {
        refresh: '/api/v1/auth/refresh',
        login: '/api/v1/auth/github',
        logout: '/api/v1/auth/logout',
      },
    };

    res.json({
      status: 'success',
      data: response,
    });
  };
}

/**
 * Automatic token refresh utility for frontend
 */
export const tokenRefreshScript = `
// Auto-refresh token logic
class TokenManager {
  constructor() {
    this.token = localStorage.getItem('disco_token');
    this.refreshTimer = null;
    this.checkInterval = null;
    this.listeners = [];
  }

  start() {
    if (this.token) {
      this.scheduleRefreshCheck();
      this.startPeriodicCheck();
    }
  }

  stop() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (this.checkInterval) clearInterval(this.checkInterval);
  }

  onTokenRefresh(callback) {
    this.listeners.push(callback);
  }

  async scheduleRefreshCheck() {
    try {
      const response = await fetch('/api/v1/auth/status', {
        headers: { 'Authorization': \`Bearer \${this.token}\` }
      });
      
      const data = await response.json();
      
      if (data.data.token.refresh_needed) {
        await this.refreshToken();
      } else {
        // Schedule next check before token expires
        const timeToRefresh = Math.max(data.data.token.expires_in - 15 * 60 * 1000, 60000);
        this.refreshTimer = setTimeout(() => this.refreshToken(), timeToRefresh);
      }
    } catch (error) {
      console.warn('Token status check failed:', error);
    }
  }

  async refreshToken() {
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${this.token}\` }
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.data.token;
        localStorage.setItem('disco_token', this.token);
        
        // Notify listeners
        this.listeners.forEach(callback => callback(this.token));
        
        // Schedule next refresh
        this.scheduleRefreshCheck();
      } else {
        // Refresh failed, redirect to login
        this.handleAuthFailure();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.handleAuthFailure();
    }
  }

  startPeriodicCheck() {
    // Check auth status every 5 minutes
    this.checkInterval = setInterval(() => {
      this.scheduleRefreshCheck();
    }, 5 * 60 * 1000);
  }

  handleAuthFailure() {
    this.stop();
    localStorage.removeItem('disco_token');
    localStorage.removeItem('disco_user');
    
    // Show auth required message
    if (typeof showNotification === 'function') {
      showNotification('error', 'Authentication expired. Please log in again.');
    }
    
    // Update UI to show login required
    if (typeof updateUI === 'function') {
      updateUI();
    }
  }
}

// Initialize token manager
const tokenManager = new TokenManager();
tokenManager.start();

// Export for use in other scripts
window.tokenManager = tokenManager;
`;

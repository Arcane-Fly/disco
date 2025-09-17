import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * GET /api/v1/auth/session
 * Check current authentication session
 */
router.get('/session', (req: Request, res: Response) => {
  try {
    // Check for JWT token in cookies or Authorization header
    const token = req.cookies['auth-token'] || 
                  (req.headers.authorization?.startsWith('Bearer ') 
                    ? req.headers.authorization.substring(7) 
                    : null);

    if (!token) {
      return res.status(401).json({ 
        authenticated: false,
        error: 'No token provided' 
      });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      username: string;
      email?: string;
      avatar_url?: string;
      name?: string;
      provider?: string;
    };
    
    // Extract user information from the token
    const user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      avatar_url: decoded.avatar_url,
      name: decoded.name,
      provider: decoded.provider
    };

    res.status(200).json({ 
      authenticated: true,
      user 
    });
  } catch (error) {
    console.error('Session verification failed:', error);
    res.status(401).json({ 
      authenticated: false,
      error: 'Invalid token' 
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout and clear session
 */
router.post('/logout', (req: Request, res: Response) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('auth-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.status(200).json({ 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout failed:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export { router as sessionRouter };
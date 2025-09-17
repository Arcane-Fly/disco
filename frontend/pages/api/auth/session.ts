import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for JWT token in cookies or Authorization header
    const token = req.cookies['auth-token'] || 
                  (req.headers.authorization?.startsWith('Bearer ') 
                    ? req.headers.authorization.substring(7) 
                    : null);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      username: string;
      email: string;
      avatar_url?: string;
      name?: string;
    };
    
    // Extract user information from the token
    const user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      avatar_url: decoded.avatar_url,
      name: decoded.name
    };

    res.status(200).json({ user });
  } catch (error) {
    console.error('Session verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}
/**
 * Authentication feature types - Simplified for Phase 1
 */

// Basic types without branded imports for now
export interface User {
  id: string;
  username: string;  
  email: string;
  avatar?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: Date;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  session: AuthSession;
  isNewUser?: boolean;
  token?: string; // For backward compatibility
  expires?: number; // For backward compatibility
  userId?: string; // For backward compatibility
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthRequest {
  apiKey?: string;
  token?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
  authentication_required?: boolean;
  setup_instructions?: any;
  user_id?: string;
  provider?: string;
  token_expires_at?: number;
  token_status?: string;
  available_methods?: string[];
}

export interface JWTPayload {
  userId: string;
  username: string;
  exp: number;
  iat: number;
  provider?: string;
}

export enum ErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  AUTH_FAILED = 'AUTH_FAILED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
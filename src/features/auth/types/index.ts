/**
 * Authentication feature types
 */

import type { UserId, Email, JwtToken } from '../../shared/types/branded';

export interface User {
  id: UserId;
  username: string;
  email: Email;
  avatar?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface AuthSession {
  userId: UserId;
  token: JwtToken;
  expiresAt: Date;
  refreshToken?: string;
}

export interface GitHubOAuthState {
  state: string;
  redirect: string;
  timestamp: number;
}

export interface AuthResponse {
  user: User;
  session: AuthSession;
  isNewUser?: boolean;
}

export interface LoginRequest {
  email: Email;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: Email;
  password: string;
}
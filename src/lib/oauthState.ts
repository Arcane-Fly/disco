import crypto from 'crypto';

// In-memory storage for OAuth state (in production, use Redis)
const authCodeStorage = new Map<string, AuthCodeData>();

interface AuthCodeData {
  userId: string;
  scope: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  clientId: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Generate OAuth state with PKCE challenge data
 */
export function generateOAuthState(redirectTo: string, codeChallenge: string, codeChallengeMethod: string, clientId: string): string {
  const state = {
    timestamp: Date.now(),
    redirectTo: redirectTo || '/',
    codeChallenge,
    codeChallengeMethod,
    clientId,
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  return Buffer.from(JSON.stringify(state)).toString('base64');
}

/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(stateParam: string): any {
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString());
    
    // Check timestamp (10 minute expiry)
    if (Date.now() - decoded.timestamp > 600000) {
      throw new Error('State expired');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid state parameter');
  }
}

/**
 * Store authorization code data for token exchange
 */
export function storeAuthCodeData(code: string, data: Omit<AuthCodeData, 'createdAt' | 'expiresAt'>): void {
  const now = Date.now();
  const authData: AuthCodeData = {
    ...data,
    createdAt: now,
    expiresAt: now + 600000 // 10 minutes
  };
  
  authCodeStorage.set(code, authData);
  
  // Clean up expired codes
  cleanupExpiredCodes();
}

/**
 * Retrieve and remove authorization code data (one-time use)
 */
export function getAndRemoveAuthCodeData(code: string): AuthCodeData | null {
  const data = authCodeStorage.get(code);
  if (!data) {
    return null;
  }
  
  // Check expiration
  if (Date.now() > data.expiresAt) {
    authCodeStorage.delete(code);
    return null;
  }
  
  // Remove after retrieval (one-time use)
  authCodeStorage.delete(code);
  return data;
}

/**
 * Verify PKCE code challenge
 */
export function verifyCodeChallenge(codeVerifier: string, codeChallenge: string, method: string = 'S256'): boolean {
  if (method === 'S256') {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return hash === codeChallenge;
  }
  // Plain method (not recommended for production)
  return codeVerifier === codeChallenge;
}

/**
 * Clean up expired authorization codes
 */
function cleanupExpiredCodes(): void {
  const now = Date.now();
  for (const [code, data] of authCodeStorage.entries()) {
    if (now > data.expiresAt) {
      authCodeStorage.delete(code);
    }
  }
}

/**
 * Generate a secure random authorization code
 */
export function generateAuthorizationCode(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCEChallenge(): { codeVerifier: string; codeChallenge: string; codeChallengeMethod: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256'
  };
}
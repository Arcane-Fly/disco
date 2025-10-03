import crypto from 'crypto';
// In-memory storage for OAuth state (in production, use Redis)
const authCodeStorage = new Map();
/**
 * Generate OAuth state with PKCE challenge data
 */
export function generateOAuthState(redirectTo, codeChallenge, codeChallengeMethod, clientId) {
    const state = {
        timestamp: Date.now(),
        redirectTo: redirectTo || '/',
        codeChallenge,
        codeChallengeMethod,
        clientId,
        nonce: crypto.randomBytes(16).toString('hex'),
    };
    return Buffer.from(JSON.stringify(state)).toString('base64');
}
/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(stateParam) {
    try {
        const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString());
        // Check timestamp (10 minute expiry)
        if (Date.now() - decoded.timestamp > 600000) {
            throw new Error('State expired');
        }
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid state parameter');
    }
}
/**
 * Store authorization code data for token exchange
 */
export function storeAuthCodeData(code, data) {
    const now = Date.now();
    const authData = {
        ...data,
        createdAt: now,
        expiresAt: now + 600000, // 10 minutes
    };
    authCodeStorage.set(code, authData);
    // Clean up expired codes
    cleanupExpiredCodes();
}
/**
 * Retrieve and remove authorization code data (one-time use)
 */
export function getAndRemoveAuthCodeData(code) {
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
export function verifyCodeChallenge(codeVerifier, codeChallenge, method = 'S256') {
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
function cleanupExpiredCodes() {
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
export function generateAuthorizationCode() {
    return crypto.randomBytes(32).toString('base64url');
}
/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCEChallenge() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return {
        codeVerifier,
        codeChallenge,
        codeChallengeMethod: 'S256',
    };
}
//# sourceMappingURL=oauthState.js.map
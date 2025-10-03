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
export declare function generateOAuthState(redirectTo: string, codeChallenge: string, codeChallengeMethod: string, clientId: string): string;
/**
 * Validate OAuth state parameter
 */
export declare function validateOAuthState(stateParam: string): any;
/**
 * Store authorization code data for token exchange
 */
export declare function storeAuthCodeData(code: string, data: Omit<AuthCodeData, 'createdAt' | 'expiresAt'>): void;
/**
 * Retrieve and remove authorization code data (one-time use)
 */
export declare function getAndRemoveAuthCodeData(code: string): AuthCodeData | null;
/**
 * Verify PKCE code challenge
 */
export declare function verifyCodeChallenge(codeVerifier: string, codeChallenge: string, method?: string): boolean;
/**
 * Generate a secure random authorization code
 */
export declare function generateAuthorizationCode(): string;
/**
 * Generate PKCE code verifier and challenge
 */
export declare function generatePKCEChallenge(): {
    codeVerifier: string;
    codeChallenge: string;
    codeChallengeMethod: string;
};
export {};
//# sourceMappingURL=oauthState.d.ts.map
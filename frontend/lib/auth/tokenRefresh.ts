/**
 * Automatic Token Refresh Utility
 * 
 * This module implements automatic JWT token refresh to prevent
 * the 1-hour token expiration from disrupting user workflow.
 * 
 * Features:
 * - Checks token expiry every minute
 * - Refreshes tokens 15 minutes before expiration
 * - Handles errors gracefully (logout on failed refresh)
 * - Logs refresh attempts and outcomes
 */

interface TokenData {
  token: string;
  expires: number;
  userId: string;
}

interface RefreshMetrics {
  totalAttempts: number;
  successfulRefreshes: number;
  failedRefreshes: number;
  lastRefreshTime: number | null;
  lastError: string | null;
}

class TokenRefreshManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private checkInterval = 60 * 1000; // Check every minute
  private refreshThreshold = 15 * 60 * 1000; // Refresh 15 minutes before expiry
  private metrics: RefreshMetrics = {
    totalAttempts: 0,
    successfulRefreshes: 0,
    failedRefreshes: 0,
    lastRefreshTime: null,
    lastError: null,
  };
  private onTokenRefreshed?: (token: string) => void;
  private onRefreshFailed?: () => void;

  /**
   * Setup automatic token refresh
   * @param token - Current JWT token
   * @param onTokenRefreshed - Callback when token is refreshed
   * @param onRefreshFailed - Callback when refresh fails (typically triggers logout)
   */
  setupTokenRefresh(
    token: string,
    onTokenRefreshed: (token: string) => void,
    onRefreshFailed: () => void
  ): void {
    // Clear any existing timer
    this.stopTokenRefresh();

    this.onTokenRefreshed = onTokenRefreshed;
    this.onRefreshFailed = onRefreshFailed;

    // Parse token to get expiry
    const tokenData = this.parseToken(token);
    if (!tokenData) {
      console.error('❌ Token refresh: Invalid token format');
      return;
    }

    console.log('✅ Token refresh: Setup complete', {
      expiresAt: new Date(tokenData.expires).toISOString(),
      userId: tokenData.userId,
      checkInterval: `${this.checkInterval / 1000}s`,
      refreshThreshold: `${this.refreshThreshold / 60000}m before expiry`,
    });

    // Start periodic checking
    this.refreshTimer = setInterval(() => {
      this.checkAndRefreshToken(token);
    }, this.checkInterval);

    // Initial check
    this.checkAndRefreshToken(token);
  }

  /**
   * Stop automatic token refresh
   */
  stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('🛑 Token refresh: Stopped');
    }
  }

  /**
   * Get refresh metrics
   */
  getMetrics(): RefreshMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalAttempts: 0,
      successfulRefreshes: 0,
      failedRefreshes: 0,
      lastRefreshTime: null,
      lastError: null,
    };
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  private async checkAndRefreshToken(currentToken: string): Promise<void> {
    const tokenData = this.parseToken(currentToken);
    if (!tokenData) {
      console.error('❌ Token refresh: Invalid token format');
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = tokenData.expires - now;

    // Check if token is already expired
    if (timeUntilExpiry <= 0) {
      console.warn('⚠️ Token refresh: Token already expired');
      this.handleRefreshFailure('Token already expired');
      return;
    }

    // Check if token needs refresh (within threshold)
    if (timeUntilExpiry <= this.refreshThreshold) {
      console.log('🔄 Token refresh: Token needs refresh', {
        timeUntilExpiry: `${Math.floor(timeUntilExpiry / 60000)}m`,
        threshold: `${this.refreshThreshold / 60000}m`,
      });

      await this.performTokenRefresh(currentToken);
    } else {
      const minutesUntilRefresh = Math.floor(
        (timeUntilExpiry - this.refreshThreshold) / 60000
      );
      console.log(`✓ Token refresh: Token valid, next check in 1 minute (${minutesUntilRefresh}m until refresh)`);
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(currentToken: string): Promise<void> {
    this.metrics.totalAttempts++;

    try {
      console.log('🔄 Token refresh: Attempting refresh...');

      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data?.token) {
        const newToken = data.data.token;
        
        this.metrics.successfulRefreshes++;
        this.metrics.lastRefreshTime = Date.now();
        this.metrics.lastError = null;

        console.log('✅ Token refresh: Success', {
          userId: data.data.userId,
          newExpiry: new Date(data.data.expires).toISOString(),
          metrics: {
            attempts: this.metrics.totalAttempts,
            successes: this.metrics.successfulRefreshes,
            failures: this.metrics.failedRefreshes,
          },
        });

        // Notify callback
        if (this.onTokenRefreshed) {
          this.onTokenRefreshed(newToken);
        }

        // Update the timer with new token
        this.setupTokenRefresh(newToken, this.onTokenRefreshed!, this.onRefreshFailed!);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.handleRefreshFailure(errorMessage);
    }
  }

  /**
   * Handle refresh failure
   */
  private handleRefreshFailure(errorMessage: string): void {
    this.metrics.failedRefreshes++;
    this.metrics.lastError = errorMessage;

    console.error('❌ Token refresh: Failed', {
      error: errorMessage,
      metrics: {
        attempts: this.metrics.totalAttempts,
        successes: this.metrics.successfulRefreshes,
        failures: this.metrics.failedRefreshes,
      },
    });

    // Stop refresh attempts
    this.stopTokenRefresh();

    // Notify callback (typically triggers logout)
    if (this.onRefreshFailed) {
      this.onRefreshFailed();
    }
  }

  /**
   * Parse JWT token to extract expiry and userId
   */
  private parseToken(token: string): TokenData | null {
    try {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode payload (base64url)
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      );

      if (!payload.exp || !payload.userId) {
        return null;
      }

      return {
        token,
        expires: payload.exp * 1000, // Convert to milliseconds
        userId: payload.userId,
      };
    } catch (error) {
      console.error('Token parsing error:', error);
      return null;
    }
  }
}

// Singleton instance
const tokenRefreshManager = new TokenRefreshManager();

/**
 * Setup automatic token refresh
 * Call this on app initialization after user logs in
 * 
 * @example
 * ```typescript
 * import { setupTokenRefresh } from '@/lib/auth/tokenRefresh';
 * 
 * // After login
 * const token = loginResponse.token;
 * setupTokenRefresh(
 *   token,
 *   (newToken) => {
 *     // Update token in state/storage
 *     setToken(newToken);
 *   },
 *   () => {
 *     // Handle refresh failure (logout user)
 *     logout();
 *   }
 * );
 * ```
 */
export function setupTokenRefresh(
  token: string,
  onTokenRefreshed: (token: string) => void,
  onRefreshFailed: () => void
): void {
  tokenRefreshManager.setupTokenRefresh(token, onTokenRefreshed, onRefreshFailed);
}

/**
 * Stop automatic token refresh
 * Call this when user logs out
 */
export function stopTokenRefresh(): void {
  tokenRefreshManager.stopTokenRefresh();
}

/**
 * Get token refresh metrics
 * Useful for monitoring and debugging
 */
export function getRefreshMetrics(): RefreshMetrics {
  return tokenRefreshManager.getMetrics();
}

/**
 * Reset token refresh metrics
 * Useful for testing or resetting counters
 */
export function resetRefreshMetrics(): void {
  tokenRefreshManager.resetMetrics();
}

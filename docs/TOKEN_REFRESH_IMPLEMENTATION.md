# Automatic Token Refresh Implementation

## Overview

This document describes the automatic JWT token refresh implementation that prevents the 1-hour token expiration from disrupting user workflow.

## Architecture

### Components

1. **Token Refresh Manager** (`frontend/lib/auth/tokenRefresh.ts`)
   - Singleton service that manages automatic token refresh
   - Checks token expiry every 60 seconds
   - Refreshes tokens 15 minutes before expiration
   - Handles errors gracefully

2. **Auth Context** (`frontend/contexts/AuthContext.tsx`)
   - Integrated with token refresh manager
   - Automatically updates token in state when refreshed
   - Triggers logout on refresh failure

3. **Backend Refresh Endpoint** (`src/api/auth.ts`)
   - `POST /api/v1/auth/refresh`
   - Accepts current token in Authorization header
   - Returns new token with 1-hour expiration
   - Validates token age (max 7 days for refresh)

## Usage

### Frontend Integration

The token refresh is automatically set up when a user logs in or when a session is restored:

```typescript
import { setupTokenRefresh } from '@/lib/auth/tokenRefresh';

// After successful login
const token = loginResponse.token;

setupTokenRefresh(
  token,
  (newToken) => {
    // Update token in state/storage
    setToken(newToken);
  },
  () => {
    // Handle refresh failure (logout user)
    logout();
  }
);
```

### Cleanup

When a user logs out, token refresh is automatically stopped:

```typescript
import { stopTokenRefresh } from '@/lib/auth/tokenRefresh';

// On logout
stopTokenRefresh();
```

## Configuration

### Timing Parameters

- **Check Interval**: 60 seconds (1 minute)
  - How often the system checks if token needs refresh
  
- **Refresh Threshold**: 15 minutes before expiration
  - When to trigger a token refresh
  
- **Token Lifetime**: 1 hour (3600 seconds)
  - How long each token is valid
  
- **Max Token Age**: 7 days
  - Maximum age a token can be before it can no longer be refreshed

### Customization

To adjust timing parameters, modify `frontend/lib/auth/tokenRefresh.ts`:

```typescript
class TokenRefreshManager {
  private checkInterval = 60 * 1000; // Change check frequency
  private refreshThreshold = 15 * 60 * 1000; // Change refresh timing
  // ...
}
```

## Monitoring

### Metrics

The token refresh manager tracks the following metrics:

```typescript
interface RefreshMetrics {
  totalAttempts: number;        // Total refresh attempts
  successfulRefreshes: number;  // Successful refreshes
  failedRefreshes: number;      // Failed refresh attempts
  lastRefreshTime: number | null; // Timestamp of last successful refresh
  lastError: string | null;     // Last error message
}
```

### Accessing Metrics

```typescript
import { getRefreshMetrics } from '@/lib/auth/tokenRefresh';

const metrics = getRefreshMetrics();
console.log('Token refresh metrics:', metrics);
```

### Logging

The system logs all token refresh events:

- ✅ Setup complete
- 🔄 Attempting refresh
- ✅ Refresh successful
- ❌ Refresh failed
- 🛑 Refresh stopped

View logs in the browser console (development) or configure log aggregation (production).

## Error Handling

### Automatic Logout

The system automatically logs out the user in these scenarios:

1. **Token Already Expired**: Token has expired and cannot be refreshed
2. **Refresh Request Failed**: Network error or server error during refresh
3. **Invalid Token**: Token format is invalid or corrupted
4. **Token Too Old**: Token is more than 7 days old

### User Experience

When automatic logout occurs:

1. Token refresh stops immediately
2. User is redirected to login page
3. Error message is logged to console
4. User session is cleared

## Security Considerations

### Token Storage

- Tokens are stored in memory (React state)
- httpOnly cookies can be used for additional security
- Never store tokens in localStorage (XSS vulnerability)

### Refresh Window

- 15-minute refresh window balances:
  - User experience (minimal interruptions)
  - Security (limited exposure time)
  - Network reliability (time for retries)

### Token Validation

- Backend validates token signature
- Backend checks token age (max 7 days)
- Backend verifies issuer and audience

## Testing

### Manual Testing

1. **Login and Wait**: Log in and observe console logs for automatic refresh
2. **Token Expiry**: Wait until 45 minutes after login to see refresh attempt
3. **Network Failure**: Disconnect network during refresh to test error handling
4. **Invalid Token**: Manually corrupt token to test validation

### Metrics Monitoring

```typescript
import { getRefreshMetrics, resetRefreshMetrics } from '@/lib/auth/tokenRefresh';

// Before test
resetRefreshMetrics();

// Run test scenario
// ...

// Check results
const metrics = getRefreshMetrics();
console.assert(metrics.successfulRefreshes > 0, 'Should have successful refreshes');
console.assert(metrics.failedRefreshes === 0, 'Should have no failures');
```

## Troubleshooting

### Token Not Refreshing

**Problem**: Token expires without being refreshed

**Solutions**:
1. Check console for error messages
2. Verify `JWT_SECRET` is set in backend
3. Ensure `/api/v1/auth/refresh` endpoint is accessible
4. Check network tab for failed requests

### Excessive Refresh Attempts

**Problem**: Token refreshes too frequently

**Solutions**:
1. Verify token contains valid `exp` field
2. Check system clock synchronization
3. Review `refreshThreshold` configuration

### Logout After Refresh

**Problem**: User is logged out immediately after token refresh

**Solutions**:
1. Check backend validation logic
2. Verify token format is correct
3. Review backend logs for errors

## Future Enhancements

### Planned Improvements

1. **Refresh Token Support**: Implement separate refresh tokens
2. **Sliding Window**: Extend token lifetime on activity
3. **Background Sync**: Use Service Workers for offline support
4. **Rate Limiting**: Prevent excessive refresh attempts
5. **Telemetry**: Send metrics to monitoring service

### Configuration UI

Future versions may include a configuration UI for:
- Adjusting refresh timing
- Viewing real-time metrics
- Configuring error handling behavior

## References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OAuth 2.0 Token Refresh](https://tools.ietf.org/html/rfc6749#section-6)
- [Frontend Security Best Practices](https://owasp.org/www-project-web-security-testing-guide/)

## Version History

- **v1.0.0** (2025-01-07): Initial implementation
  - Basic automatic token refresh
  - Error handling and logging
  - Metrics tracking
  - Auth context integration

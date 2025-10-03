/**
 * Strict API Response Types
 * Eliminates 'any' usage with proper type definitions
 */
// Type Guards
export const isSuccessResponse = (response) => {
    return response.status === 'success' && response.data !== undefined;
};
export const isErrorResponse = (response) => {
    return response.status === 'error' && response.error !== undefined;
};
export const isValidationError = (error) => {
    return error.type === 'VALIDATION_ERROR';
};
export const isAuthenticationError = (error) => {
    return error.type === 'AUTHENTICATION_ERROR';
};
export const isAuthorizationError = (error) => {
    return error.type === 'AUTHORIZATION_ERROR';
};
export const isRateLimitError = (error) => {
    return error.type === 'RATE_LIMIT_ERROR';
};
// Response Builder Utilities
export const createSuccessResponse = (data, metadata) => ({
    status: 'success',
    data,
    metadata: {
        timestamp: Date.now(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
        ...metadata,
    },
});
export const createErrorResponse = (error, metadata) => ({
    status: 'error',
    error,
    metadata: {
        timestamp: Date.now(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
        ...metadata,
    },
});
export const createPaginatedResponse = (items, pagination, metadata) => ({
    status: 'success',
    data: items,
    pagination,
    metadata: {
        timestamp: Date.now(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
        ...metadata,
    },
});
//# sourceMappingURL=api.js.map
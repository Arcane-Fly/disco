/**
 * Express Route Handler Types
 * Typed interfaces for Express route handlers with proper error handling
 */
// Utility functions for route handlers
// Note: Simple versions of response creators to avoid conflicts
export const createSuccessResponseExpress = (data, message) => ({
    status: 'success',
    data,
    metadata: {
        timestamp: Date.now(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
    },
});
export const createErrorResponseExpress = (error) => ({
    status: 'error',
    error,
    metadata: {
        timestamp: Date.now(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
    },
});
// Re-export with normal names but prevent conflicts
export { createSuccessResponseExpress as createSuccessResponse };
export { createErrorResponseExpress as createErrorResponse };
// Parameter validation helpers
export const validateRequiredParam = (value, paramName) => {
    if (!value) {
        throw new Error(`Missing required parameter: ${paramName}`);
    }
    return value;
};
export const validateOptionalParam = (value, defaultValue) => {
    return value || defaultValue;
};
export const parseIntParam = (value, paramName, defaultValue) => {
    if (!value) {
        if (defaultValue !== undefined)
            return defaultValue;
        throw new Error(`Missing required parameter: ${paramName}`);
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Invalid number parameter: ${paramName}`);
    }
    return parsed;
};
export const parseBooleanParam = (value, defaultValue = false) => {
    if (!value)
        return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
};
// Async handler wrapper to catch errors
export const asyncHandler = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};
// Request validation wrapper
export const validateRequest = (validationRules, handler) => {
    return asyncHandler(async (req, res, next) => {
        // Validation logic would go here
        // For now, just pass through to the handler
        await handler(req, res, next);
    });
};
// Common error responses
export const sendValidationError = (res, errors) => {
    res.status(400).json({
        status: 'error',
        error: {
            type: 'VALIDATION_ERROR',
            field: errors[0]?.field || 'unknown',
            message: errors[0]?.message || 'Validation failed',
            code: 'INVALID_FORMAT',
            details: { errors },
        }
    });
};
export const sendAuthenticationError = (res, message = 'Authentication required') => {
    res.status(401).json({
        status: 'error',
        error: {
            type: 'AUTHENTICATION_ERROR',
            message,
            code: 'MISSING_CREDENTIALS',
        }
    });
};
export const sendAuthorizationError = (res, resource, action) => {
    res.status(403).json({
        status: 'error',
        error: {
            type: 'AUTHORIZATION_ERROR',
            resource,
            action,
            message: `Insufficient permissions to ${action} ${resource}`,
            code: 'INSUFFICIENT_PERMISSIONS',
        }
    });
};
export const sendNotFoundError = (res, resource, identifier) => {
    res.status(404).json({
        status: 'error',
        error: {
            type: 'NOT_FOUND_ERROR',
            resource,
            identifier,
            message: `${resource} with ID ${identifier} not found`,
        }
    });
};
export const sendInternalError = (res, error) => {
    const correlationId = crypto.randomUUID();
    // Log the full error for debugging
    console.error(`Internal error [${correlationId}]:`, error);
    res.status(500).json({
        status: 'error',
        error: {
            type: 'INTERNAL_ERROR',
            code: 'INTERNAL_ERROR',
            message: 'An internal server error occurred',
            correlationId,
            details: process.env.NODE_ENV === 'development' ? { error: error.message } : undefined,
        }
    });
};
//# sourceMappingURL=express.js.map
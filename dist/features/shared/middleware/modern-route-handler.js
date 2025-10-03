/**
 * Modern Route Handler Middleware
 * Systematic approach to modernize Express route handlers
 */
// Modern async wrapper that ensures proper return handling
export const modernHandler = (fn) => {
    return (req, res, next) => {
        const result = fn(req, res, next);
        if (result instanceof Promise) {
            result.catch(next);
        }
    };
};
// Parameter validation middleware
export const validateParams = (requiredParams) => {
    return (req, res, next) => {
        const missing = requiredParams.filter(param => !req.params[param]);
        if (missing.length > 0) {
            res.status(400).json({
                status: 'error',
                error: {
                    code: 'MISSING_PARAMETERS',
                    message: `Missing required parameters: ${missing.join(', ')}`,
                },
            });
            return;
        }
        next();
    };
};
// Body validation middleware
export const validateBody = (requiredFields) => {
    return (req, res, next) => {
        const missing = requiredFields.filter(field => !(field in req.body));
        if (missing.length > 0) {
            res.status(400).json({
                status: 'error',
                error: {
                    code: 'MISSING_FIELDS',
                    message: `Missing required fields: ${missing.join(', ')}`,
                },
            });
            return;
        }
        next();
    };
};
// Standard response helpers
export const sendSuccess = (res, data) => {
    res.json({
        status: 'success',
        data,
        timestamp: new Date().toISOString(),
    });
};
export const sendError = (res, status, code, message) => {
    res.status(status).json({
        status: 'error',
        error: {
            code,
            message,
        },
        timestamp: new Date().toISOString(),
    });
};
// Common error responses
export const badRequest = (res, message = 'Bad Request') => sendError(res, 400, 'BAD_REQUEST', message);
export const unauthorized = (res, message = 'Unauthorized') => sendError(res, 401, 'UNAUTHORIZED', message);
export const forbidden = (res, message = 'Forbidden') => sendError(res, 403, 'FORBIDDEN', message);
export const notFound = (res, message = 'Not Found') => sendError(res, 404, 'NOT_FOUND', message);
export const serverError = (res, error) => {
    console.error('Server error:', error);
    sendError(res, 500, 'INTERNAL_ERROR', 'Internal Server Error');
};
//# sourceMappingURL=modern-route-handler.js.map
// Export centralized types
export * from './metrics.js';
export * from './theme.js';
// Error codes
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    ErrorCode["AUTH_FAILED"] = "AUTH_FAILED";
    ErrorCode["CONTAINER_NOT_FOUND"] = "CONTAINER_NOT_FOUND";
    ErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    ErrorCode["EXECUTION_ERROR"] = "EXECUTION_ERROR";
    ErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["WEBCONTAINER_ERROR"] = "WEBCONTAINER_ERROR";
    ErrorCode["GIT_ERROR"] = "GIT_ERROR";
})(ErrorCode || (ErrorCode = {}));
//# sourceMappingURL=index.js.map
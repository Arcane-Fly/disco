/**
 * MCP Contract Validator
 * Runtime validation for MCP server requests and responses using JSON Schema
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join } from 'path';
// Error codes matching the error.envelope.json schema
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["AUTH_REQUIRED"] = "AUTH_REQUIRED";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["RATE_LIMIT"] = "RATE_LIMIT";
    ErrorCode["UPSTREAM_ERROR"] = "UPSTREAM_ERROR";
    ErrorCode["UNAVAILABLE"] = "UNAVAILABLE";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(ErrorCode || (ErrorCode = {}));
// Validation error class
export class ContractValidationError extends Error {
    code;
    details;
    retriable;
    constructor(code, message, details, retriable = false) {
        super(message);
        this.code = code;
        this.details = details;
        this.retriable = retriable;
        this.name = 'ContractValidationError';
    }
    toErrorEnvelope() {
        return {
            error: {
                code: this.code,
                message: this.message,
                retriable: this.retriable,
                details: this.details,
            },
        };
    }
}
/**
 * Contract validator for MCP operations
 */
export class ContractValidator {
    ajv;
    validators = new Map();
    contractsPath;
    constructor(contractsPath) {
        this.contractsPath = contractsPath || join(process.cwd(), 'contracts');
        this.ajv = new Ajv({
            allErrors: true,
            strict: true,
            validateFormats: true,
            validateSchema: false, // Don't validate meta-schema
            addUsedSchema: false, // Don't add used schemas automatically
        });
        addFormats(this.ajv);
    }
    /**
     * Load a JSON schema from file
     */
    loadSchema(schemaPath) {
        try {
            const fullPath = join(this.contractsPath, schemaPath);
            const schemaContent = readFileSync(fullPath, 'utf-8');
            return JSON.parse(schemaContent);
        }
        catch (error) {
            throw new Error(`Failed to load schema ${schemaPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get or compile a validator for a schema
     */
    getValidator(schemaPath) {
        if (!this.validators.has(schemaPath)) {
            const schema = this.loadSchema(schemaPath);
            const validator = this.ajv.compile(schema);
            this.validators.set(schemaPath, validator);
        }
        return this.validators.get(schemaPath);
    }
    /**
     * Format Ajv errors into readable message
     */
    formatErrors(errors) {
        if (!errors || errors.length === 0) {
            return 'Validation failed';
        }
        return errors
            .map((err) => {
            const path = err.instancePath || 'root';
            return `${path}: ${err.message}`;
        })
            .join('; ');
    }
    /**
     * Validate data against a schema
     */
    validate(data, schemaPath) {
        const validator = this.getValidator(schemaPath);
        if (!validator(data)) {
            const message = this.formatErrors(validator.errors);
            throw new ContractValidationError(ErrorCode.INVALID_INPUT, message, {
                errors: validator.errors,
            });
        }
    }
    /**
     * Validate request data
     */
    validateRequest(data, service, operation) {
        const schemaPath = `${service}/${operation}.request.json`;
        this.validate(data, schemaPath);
    }
    /**
     * Validate response data
     */
    validateResponse(data, service, operation) {
        const schemaPath = `${service}/${operation}.response.json`;
        this.validate(data, schemaPath);
    }
    /**
     * Validate error envelope
     */
    validateError(data) {
        this.validate(data, 'shared/error.envelope.json');
    }
    /**
     * Wrap an async operation with request/response validation
     */
    async validateOperation(service, operation, request, handler) {
        // Validate request
        try {
            this.validateRequest(request, service, operation);
        }
        catch (error) {
            if (error instanceof ContractValidationError) {
                throw error;
            }
            throw new ContractValidationError(ErrorCode.INVALID_INPUT, error instanceof Error ? error.message : 'Request validation failed');
        }
        // Execute handler
        let response;
        try {
            response = await handler(request);
        }
        catch (error) {
            if (error instanceof ContractValidationError) {
                throw error;
            }
            throw new ContractValidationError(ErrorCode.UPSTREAM_ERROR, error instanceof Error ? error.message : 'Operation failed', undefined, true // upstream errors may be retriable
            );
        }
        // Validate response
        try {
            this.validateResponse(response, service, operation);
        }
        catch (error) {
            throw new ContractValidationError(ErrorCode.UPSTREAM_ERROR, error instanceof Error ? error.message : 'Response validation failed', { response });
        }
        return response;
    }
}
// Singleton instance
let globalValidator = null;
/**
 * Get the global validator instance
 */
export function getValidator(contractsPath) {
    if (!globalValidator) {
        globalValidator = new ContractValidator(contractsPath);
    }
    return globalValidator;
}
/**
 * Helper function to validate request
 */
export function validateRequest(data, service, operation) {
    getValidator().validateRequest(data, service, operation);
}
/**
 * Helper function to validate response
 */
export function validateResponse(data, service, operation) {
    getValidator().validateResponse(data, service, operation);
}
/**
 * Helper function to create error envelope
 */
export function createErrorEnvelope(code, message, retriable = false, details) {
    return {
        error: {
            code,
            message,
            retriable,
            details,
        },
    };
}
//# sourceMappingURL=contractValidator.js.map
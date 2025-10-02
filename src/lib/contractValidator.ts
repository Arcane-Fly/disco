/**
 * MCP Contract Validator
 * Runtime validation for MCP server requests and responses using JSON Schema
 */

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join } from 'path';

// Error codes matching the error.envelope.json schema
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  UNAVAILABLE = 'UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Standard error envelope interface
export interface ErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
    retriable?: boolean;
    details?: Record<string, unknown>;
  };
}

// Validation error class
export class ContractValidationError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>,
    public retriable: boolean = false
  ) {
    super(message);
    this.name = 'ContractValidationError';
  }

  toErrorEnvelope(): ErrorEnvelope {
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
  private ajv: Ajv;
  private validators: Map<string, ValidateFunction> = new Map();
  private contractsPath: string;

  constructor(contractsPath?: string) {
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
  private loadSchema(schemaPath: string): object {
    try {
      const fullPath = join(this.contractsPath, schemaPath);
      const schemaContent = readFileSync(fullPath, 'utf-8');
      return JSON.parse(schemaContent);
    } catch (error) {
      throw new Error(
        `Failed to load schema ${schemaPath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get or compile a validator for a schema
   */
  private getValidator(schemaPath: string): ValidateFunction {
    if (!this.validators.has(schemaPath)) {
      const schema = this.loadSchema(schemaPath);
      const validator = this.ajv.compile(schema);
      this.validators.set(schemaPath, validator);
    }
    return this.validators.get(schemaPath)!;
  }

  /**
   * Format Ajv errors into readable message
   */
  private formatErrors(errors: ErrorObject[] | null | undefined): string {
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
  validate(data: unknown, schemaPath: string): void {
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
  validateRequest(data: unknown, service: string, operation: string): void {
    const schemaPath = `${service}/${operation}.request.json`;
    this.validate(data, schemaPath);
  }

  /**
   * Validate response data
   */
  validateResponse(data: unknown, service: string, operation: string): void {
    const schemaPath = `${service}/${operation}.response.json`;
    this.validate(data, schemaPath);
  }

  /**
   * Validate error envelope
   */
  validateError(data: unknown): void {
    this.validate(data, 'shared/error.envelope.json');
  }

  /**
   * Wrap an async operation with request/response validation
   */
  async validateOperation<TRequest, TResponse>(
    service: string,
    operation: string,
    request: TRequest,
    handler: (req: TRequest) => Promise<TResponse>
  ): Promise<TResponse> {
    // Validate request
    try {
      this.validateRequest(request, service, operation);
    } catch (error) {
      if (error instanceof ContractValidationError) {
        throw error;
      }
      throw new ContractValidationError(
        ErrorCode.INVALID_INPUT,
        error instanceof Error ? error.message : 'Request validation failed'
      );
    }

    // Execute handler
    let response: TResponse;
    try {
      response = await handler(request);
    } catch (error) {
      if (error instanceof ContractValidationError) {
        throw error;
      }
      throw new ContractValidationError(
        ErrorCode.UPSTREAM_ERROR,
        error instanceof Error ? error.message : 'Operation failed',
        undefined,
        true // upstream errors may be retriable
      );
    }

    // Validate response
    try {
      this.validateResponse(response, service, operation);
    } catch (error) {
      throw new ContractValidationError(
        ErrorCode.UPSTREAM_ERROR,
        error instanceof Error ? error.message : 'Response validation failed',
        { response }
      );
    }

    return response;
  }
}

// Singleton instance
let globalValidator: ContractValidator | null = null;

/**
 * Get the global validator instance
 */
export function getValidator(contractsPath?: string): ContractValidator {
  if (!globalValidator) {
    globalValidator = new ContractValidator(contractsPath);
  }
  return globalValidator;
}

/**
 * Helper function to validate request
 */
export function validateRequest(data: unknown, service: string, operation: string): void {
  getValidator().validateRequest(data, service, operation);
}

/**
 * Helper function to validate response
 */
export function validateResponse(data: unknown, service: string, operation: string): void {
  getValidator().validateResponse(data, service, operation);
}

/**
 * Helper function to create error envelope
 */
export function createErrorEnvelope(
  code: ErrorCode,
  message: string,
  retriable = false,
  details?: Record<string, unknown>
): ErrorEnvelope {
  return {
    error: {
      code,
      message,
      retriable,
      details,
    },
  };
}

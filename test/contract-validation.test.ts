/**
 * Contract Validation Tests
 * Tests JSON Schema validation for MCP server contracts
 */

import { describe, it, expect } from '@jest/globals';
import {
  ContractValidator,
  ErrorCode,
  ContractValidationError,
  createErrorEnvelope,
} from '../src/lib/contractValidator';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('ContractValidator', () => {
  const validator = new ContractValidator();
  const examplesPath = join(process.cwd(), 'contracts', 'examples');

  // Helper to load example
  const loadExample = (filename: string) => {
    const content = readFileSync(join(examplesPath, filename), 'utf-8');
    return JSON.parse(content);
  };

  describe('Pinecone Contracts', () => {
    it('should validate valid upsert request', () => {
      const example = loadExample('pinecone.upsert.example.json');
      expect(() => {
        validator.validateRequest(example.request, 'pinecone', 'upsert');
      }).not.toThrow();
    });

    it('should validate valid upsert response', () => {
      const example = loadExample('pinecone.upsert.example.json');
      expect(() => {
        validator.validateResponse(example.response, 'pinecone', 'upsert');
      }).not.toThrow();
    });

    it('should reject upsert request with missing namespace', () => {
      const invalid = {
        vectors: [
          {
            id: 'vec1',
            values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
          },
        ],
      };

      expect(() => {
        validator.validateRequest(invalid, 'pinecone', 'upsert');
      }).toThrow(ContractValidationError);
    });

    it('should reject upsert request with too few vector dimensions', () => {
      const invalid = {
        namespace: 'default',
        vectors: [
          {
            id: 'vec1',
            values: [0.1, 0.2], // Only 2 dimensions, minimum is 8
          },
        ],
      };

      expect(() => {
        validator.validateRequest(invalid, 'pinecone', 'upsert');
      }).toThrow(ContractValidationError);
    });

    it('should validate valid query request', () => {
      const example = loadExample('pinecone.query.example.json');
      expect(() => {
        validator.validateRequest(example.request, 'pinecone', 'query');
      }).not.toThrow();
    });

    it('should validate valid query response', () => {
      const example = loadExample('pinecone.query.example.json');
      expect(() => {
        validator.validateResponse(example.response, 'pinecone', 'query');
      }).not.toThrow();
    });

    it('should reject query request with invalid topK', () => {
      const invalid = {
        vector: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
        topK: 0, // Must be at least 1
      };

      expect(() => {
        validator.validateRequest(invalid, 'pinecone', 'query');
      }).toThrow(ContractValidationError);
    });
  });

  describe('Supabase Contracts', () => {
    it('should validate valid SQL request', () => {
      const example = loadExample('supabase.sql.example.json');
      expect(() => {
        validator.validateRequest(example.request, 'supabase', 'sql');
      }).not.toThrow();
    });

    it('should validate valid SQL response', () => {
      const example = loadExample('supabase.sql.example.json');
      expect(() => {
        validator.validateResponse(example.response, 'supabase', 'sql');
      }).not.toThrow();
    });

    it('should reject SQL request with missing query', () => {
      const invalid = {
        params: ['active'],
        timeout: 30000,
      };

      expect(() => {
        validator.validateRequest(invalid, 'supabase', 'sql');
      }).toThrow(ContractValidationError);
    });

    it('should reject SQL request with invalid timeout', () => {
      const invalid = {
        query: 'SELECT * FROM users',
        timeout: 500, // Minimum is 1000ms
      };

      expect(() => {
        validator.validateRequest(invalid, 'supabase', 'sql');
      }).toThrow(ContractValidationError);
    });
  });

  describe('Browserbase Contracts', () => {
    it('should validate valid navigate request', () => {
      const example = loadExample('browserbase.navigate.example.json');
      expect(() => {
        validator.validateRequest(example.request, 'browserbase', 'navigate');
      }).not.toThrow();
    });

    it('should validate valid navigate response', () => {
      const example = loadExample('browserbase.navigate.example.json');
      expect(() => {
        validator.validateResponse(example.response, 'browserbase', 'navigate');
      }).not.toThrow();
    });

    it('should reject navigate request with missing URL', () => {
      const invalid = {
        waitUntil: 'load',
        timeout: 30000,
      };

      expect(() => {
        validator.validateRequest(invalid, 'browserbase', 'navigate');
      }).toThrow(ContractValidationError);
    });

    it('should reject navigate request with invalid waitUntil', () => {
      const invalid = {
        url: 'https://example.com',
        waitUntil: 'invalid', // Not in enum
      };

      expect(() => {
        validator.validateRequest(invalid, 'browserbase', 'navigate');
      }).toThrow(ContractValidationError);
    });
  });

  describe('GitHub Contracts', () => {
    it('should validate valid searchIssues request', () => {
      const example = loadExample('github.searchIssues.example.json');
      expect(() => {
        validator.validateRequest(example.request, 'github', 'searchIssues');
      }).not.toThrow();
    });

    it('should validate valid searchIssues response', () => {
      const example = loadExample('github.searchIssues.example.json');
      expect(() => {
        validator.validateResponse(example.response, 'github', 'searchIssues');
      }).not.toThrow();
    });

    it('should reject searchIssues request with missing query', () => {
      const invalid = {
        sort: 'updated',
        order: 'desc',
      };

      expect(() => {
        validator.validateRequest(invalid, 'github', 'searchIssues');
      }).toThrow(ContractValidationError);
    });

    it('should reject searchIssues request with invalid perPage', () => {
      const invalid = {
        query: 'is:issue is:open',
        perPage: 200, // Maximum is 100
      };

      expect(() => {
        validator.validateRequest(invalid, 'github', 'searchIssues');
      }).toThrow(ContractValidationError);
    });
  });

  describe('Error Envelope', () => {
    it('should validate valid error envelope', () => {
      const error = createErrorEnvelope(
        ErrorCode.INVALID_INPUT,
        'Validation failed',
        false,
        { field: 'namespace' }
      );

      expect(() => {
        validator.validateError(error);
      }).not.toThrow();
    });

    it('should reject error envelope with invalid code', () => {
      const invalid = {
        error: {
          code: 'INVALID_CODE', // Not in enum
          message: 'Some error',
        },
      };

      expect(() => {
        validator.validateError(invalid);
      }).toThrow(ContractValidationError);
    });

    it('should reject error envelope with missing message', () => {
      const invalid = {
        error: {
          code: 'INVALID_INPUT',
          // message is required
        },
      };

      expect(() => {
        validator.validateError(invalid);
      }).toThrow(ContractValidationError);
    });
  });

  describe('validateOperation', () => {
    it('should validate complete operation flow', async () => {
      const request = {
        namespace: 'test',
        vectors: [
          {
            id: 'vec1',
            values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
          },
        ],
      };

      const handler = async (req: typeof request) => {
        return {
          upsertedCount: req.vectors.length,
          warnings: [],
        };
      };

      const response = await validator.validateOperation(
        'pinecone',
        'upsert',
        request,
        handler
      );

      expect(response.upsertedCount).toBe(1);
      expect(response.warnings).toEqual([]);
    });

    it('should throw on invalid request', async () => {
      const request = {
        vectors: [], // Missing namespace
      };

      const handler = async () => {
        return { upsertedCount: 0, warnings: [] };
      };

      await expect(
        validator.validateOperation('pinecone', 'upsert', request, handler)
      ).rejects.toThrow(ContractValidationError);
    });

    it('should throw on invalid response', async () => {
      const request = {
        namespace: 'test',
        vectors: [
          {
            id: 'vec1',
            values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
          },
        ],
      };

      const handler = async () => {
        return {
          // Missing required upsertedCount field
          warnings: [],
        };
      };

      await expect(
        validator.validateOperation('pinecone', 'upsert', request, handler)
      ).rejects.toThrow(ContractValidationError);
    });
  });

  describe('ContractValidationError', () => {
    it('should create error with all properties', () => {
      const error = new ContractValidationError(
        ErrorCode.RATE_LIMIT,
        'Rate limit exceeded',
        { limit: 100 },
        true
      );

      expect(error.code).toBe(ErrorCode.RATE_LIMIT);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.details).toEqual({ limit: 100 });
      expect(error.retriable).toBe(true);
      expect(error.name).toBe('ContractValidationError');
    });

    it('should convert to error envelope', () => {
      const error = new ContractValidationError(
        ErrorCode.INVALID_INPUT,
        'Validation failed',
        { field: 'namespace' },
        false
      );

      const envelope = error.toErrorEnvelope();

      expect(envelope).toEqual({
        error: {
          code: 'INVALID_INPUT',
          message: 'Validation failed',
          retriable: false,
          details: { field: 'namespace' },
        },
      });
    });
  });
});

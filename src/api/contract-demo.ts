/**
 * Contract Validation Demo Endpoint
 * Demonstrates integration of JSON Schema validation with MCP endpoints
 */

import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import {
  ContractValidator,
  ErrorCode,
  ContractValidationError,
  createErrorEnvelope,
} from '../lib/contractValidator.js';

const router = Router();
const validator = new ContractValidator();

// Rate limiter for schema file access endpoint
const contractSchemaRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Too many requests, please try again later.'
    }
  }
});
/**
 * Demo: Pinecone Upsert with Contract Validation
 * POST /api/contract-demo/pinecone/upsert
 */
router.post('/pinecone/upsert', async (req: Request, res: Response) => {
  try {
    const response = await validator.validateOperation(
      'pinecone',
      'upsert',
      req.body,
      async (request) => {
        // Simulate Pinecone upsert operation
        // In production, this would call the actual Pinecone client
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call

        return {
          upsertedCount: request.vectors.length,
          warnings: [],
        };
      }
    );

    res.json(response);
  } catch (error) {
    if (error instanceof ContractValidationError) {
      return res.status(400).json(error.toErrorEnvelope());
    }

    res.status(500).json(
      createErrorEnvelope(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
});

/**
 * Demo: Pinecone Query with Contract Validation
 * POST /api/contract-demo/pinecone/query
 */
router.post('/pinecone/query', async (req: Request, res: Response) => {
  try {
    const response = await validator.validateOperation(
      'pinecone',
      'query',
      req.body,
      async (request) => {
        // Simulate Pinecone query operation
        await new Promise((resolve) => setTimeout(resolve, 100));

        return {
          matches: [
            {
              id: 'vec1',
              score: 0.95,
              ...(request.includeMetadata && {
                metadata: { source: 'document-123', category: 'technical' },
              }),
              ...(request.includeValues && { values: request.vector }),
            },
          ],
          namespace: request.namespace || 'default',
        };
      }
    );

    res.json(response);
  } catch (error) {
    if (error instanceof ContractValidationError) {
      return res.status(400).json(error.toErrorEnvelope());
    }

    res.status(500).json(
      createErrorEnvelope(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
});

/**
 * Demo: Supabase SQL with Contract Validation
 * POST /api/contract-demo/supabase/sql
 */
router.post('/supabase/sql', async (req: Request, res: Response) => {
  try {
    const response = await validator.validateOperation(
      'supabase',
      'sql',
      req.body,
      async (request) => {
        // Simulate SQL execution
        await new Promise((resolve) => setTimeout(resolve, 100));

        return {
          data: [
            { id: 1, name: 'Test User', created_at: new Date().toISOString() },
          ],
          rowCount: 1,
          executionTime: 45.2,
          warnings: [],
        };
      }
    );

    res.json(response);
  } catch (error) {
    if (error instanceof ContractValidationError) {
      return res.status(400).json(error.toErrorEnvelope());
    }

    res.status(500).json(
      createErrorEnvelope(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
});

/**
 * Demo: Browserbase Navigate with Contract Validation
 * POST /api/contract-demo/browserbase/navigate
 */
router.post('/browserbase/navigate', async (req: Request, res: Response) => {
  try {
    const response = await validator.validateOperation(
      'browserbase',
      'navigate',
      req.body,
      async (request) => {
        // Simulate browser navigation
        await new Promise((resolve) => setTimeout(resolve, 200));

        return {
          url: request.url,
          title: 'Example Domain',
          statusCode: 200,
          loadTime: 1234.5,
        };
      }
    );

    res.json(response);
  } catch (error) {
    if (error instanceof ContractValidationError) {
      return res.status(400).json(error.toErrorEnvelope());
    }

    res.status(500).json(
      createErrorEnvelope(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
});

/**
 * Demo: GitHub Search Issues with Contract Validation
 * POST /api/contract-demo/github/searchIssues
 */
router.post('/github/searchIssues', async (req: Request, res: Response) => {
  try {
    const response = await validator.validateOperation(
      'github',
      'searchIssues',
      req.body,
      async (request) => {
        // Simulate GitHub API call
        await new Promise((resolve) => setTimeout(resolve, 150));

        return {
          totalCount: 42,
          items: [
            {
              id: 123456789,
              number: 15,
              title: 'Example Issue',
              state: 'open' as const,
              url: 'https://github.com/owner/repo/issues/15',
              body: 'Issue description',
              labels: ['bug', 'help wanted'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          pagination: {
            page: request.page || 1,
            perPage: request.perPage || 30,
            hasNextPage: true,
          },
        };
      }
    );

    res.json(response);
  } catch (error) {
    if (error instanceof ContractValidationError) {
      return res.status(400).json(error.toErrorEnvelope());
    }

    res.status(500).json(
      createErrorEnvelope(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
});

/**
 * Get contract schema
 * GET /api/contract-demo/:service/:operation/:type
 */
router.get('/:service/:operation/:type', contractSchemaRateLimiter, (req: Request, res: Response) => {
  try {
    const { service, operation, type } = req.params;

    if (!['request', 'response'].includes(type)) {
      return res.status(400).json(
        createErrorEnvelope(
          ErrorCode.INVALID_INPUT,
          'Type must be "request" or "response"'
        )
      );
    }

    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(
      process.cwd(),
      'contracts',
      service,
      `${operation}.${type}.json`
    );

    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json(
        createErrorEnvelope(ErrorCode.NOT_FOUND, 'Schema not found')
      );
    }

    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    res.json(schema);
  } catch (error) {
    res.status(500).json(
      createErrorEnvelope(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
});

/**
 * List available contracts
 * GET /api/contract-demo/contracts
 */
router.get('/contracts', (req: Request, res: Response) => {
  res.json({
    contracts: [
      {
        service: 'pinecone',
        operations: ['upsert', 'query'],
        description: 'Vector database operations',
      },
      {
        service: 'supabase',
        operations: ['sql'],
        description: 'Database SQL operations',
      },
      {
        service: 'browserbase',
        operations: ['navigate'],
        description: 'Browser automation',
      },
      {
        service: 'github',
        operations: ['searchIssues'],
        description: 'GitHub API operations',
      },
    ],
    documentation: '/contracts/README.md',
    examples: '/contracts/examples/',
  });
});

export { router as contractDemoRouter };

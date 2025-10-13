import { Router, Request, Response } from 'express';
import { ErrorCode } from '../types/index.js';
import {
  ALLOWED_OPENAI_MODELS,
  ALLOWED_EMBEDDING_MODELS,
  DEFAULT_OPENAI_MODEL,
  DEFAULT_EMBEDDING_MODEL,
  isAllowedOpenAIModel,
  isAllowedEmbeddingModel,
} from '../config/openai.js';

const router = Router();

/**
 * Get OpenAI client (lazy loaded to avoid import errors if not installed)
 */
function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  
  try {
    // Dynamic import to avoid errors when OpenAI SDK is not installed
    // Note: Requires 'openai' package to be installed
    // Run: yarn add openai
    return null; // Placeholder until openai package is added
  } catch (error) {
    console.error('OpenAI SDK not installed. Run: yarn add openai');
    return null;
  }
}

/**
 * GET /api/v1/openai/status
 * Check OpenAI API configuration status
 */
router.get('/status', async (_req: Request, res: Response) => {
  const hasKey = !!process.env.OPENAI_API_KEY;
  res.json({
    status: 'success',
    data: {
      sdk: 'openai (requires installation)',
      apiKeyConfigured: hasKey,
      defaultModel: DEFAULT_OPENAI_MODEL,
      defaultEmbeddingModel: DEFAULT_EMBEDDING_MODEL,
      allowedModels: ALLOWED_OPENAI_MODELS,
      allowedEmbeddingModels: ALLOWED_EMBEDDING_MODELS,
    },
  });
});

/**
 * GET /api/v1/openai/models
 * Get list of allowed OpenAI models
 */
router.get('/models', async (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      chat: {
        allowed: ALLOWED_OPENAI_MODELS,
        default: DEFAULT_OPENAI_MODEL,
      },
      embeddings: {
        allowed: ALLOWED_EMBEDDING_MODELS,
        default: DEFAULT_EMBEDDING_MODEL,
      },
    },
  });
});

/**
 * POST /api/v1/openai/validate-model
 * Validate if a model is allowed
 */
router.post('/validate-model', async (req: Request, res: Response) => {
  const { model, type = 'chat' } = req.body || {};
  
  if (!model || typeof model !== 'string') {
    return res.status(400).json({
      status: 'error',
      error: { code: ErrorCode.INVALID_REQUEST, message: 'model is required' },
    });
  }

  const allowed = type === 'embeddings' 
    ? isAllowedEmbeddingModel(model)
    : isAllowedOpenAIModel(model);

  res.json({
    status: 'success',
    data: {
      model,
      type,
      allowed,
    },
  });
});

/**
 * POST /api/v1/openai/chat/completions
 * Create a chat completion using OpenAI API
 * 
 * @todo Implement once openai package is installed
 * @see contracts/openai/chat-completions.request.json for schema
 */
router.post('/chat/completions', async (req: Request, res: Response) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(503).json({
        status: 'error',
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'OpenAI SDK not configured. Install with: yarn add openai',
        },
      });
    }

    const { model = DEFAULT_OPENAI_MODEL, messages, ...options } = req.body || {};

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: { code: ErrorCode.INVALID_REQUEST, message: 'messages array is required' },
      });
    }

    if (!isAllowedOpenAIModel(model)) {
      return res.status(400).json({
        status: 'error',
        error: { code: ErrorCode.INVALID_REQUEST, message: `Model '${model}' is not allowed` },
      });
    }

    // TODO: Implement actual OpenAI API call when SDK is installed
    // const response = await client.chat.completions.create({
    //   model,
    //   messages,
    //   ...options,
    // });
    
    // Placeholder response
    return res.status(503).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'OpenAI chat completions not yet implemented. Install openai package first.',
      },
    });
  } catch (error) {
    console.error('OpenAI chat completion error:', error);
    res.status(500).json({
      status: 'error',
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'OpenAI request failed' },
    });
  }
});

/**
 * POST /api/v1/openai/embeddings
 * Create embeddings using OpenAI API
 * 
 * @todo Implement once openai package is installed
 * @see contracts/openai/embeddings.request.json for schema
 */
router.post('/embeddings', async (req: Request, res: Response) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(503).json({
        status: 'error',
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'OpenAI SDK not configured. Install with: yarn add openai',
        },
      });
    }

    const { model = DEFAULT_EMBEDDING_MODEL, input, ...options } = req.body || {};

    // Validate required fields
    if (!input) {
      return res.status(400).json({
        status: 'error',
        error: { code: ErrorCode.INVALID_REQUEST, message: 'input is required' },
      });
    }

    if (!isAllowedEmbeddingModel(model)) {
      return res.status(400).json({
        status: 'error',
        error: { code: ErrorCode.INVALID_REQUEST, message: `Model '${model}' is not allowed` },
      });
    }

    // TODO: Implement actual OpenAI API call when SDK is installed
    // const response = await client.embeddings.create({
    //   model,
    //   input,
    //   ...options,
    // });

    // Placeholder response
    return res.status(503).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'OpenAI embeddings not yet implemented. Install openai package first.',
      },
    });
  } catch (error) {
    console.error('OpenAI embeddings error:', error);
    res.status(500).json({
      status: 'error',
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'OpenAI request failed' },
    });
  }
});

export { router as openaiRouter };

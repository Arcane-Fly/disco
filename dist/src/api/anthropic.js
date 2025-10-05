import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { ErrorCode } from '../types/index.js';
import { ALLOWED_CLAUDE_MODELS, DEFAULT_CLAUDE_MODEL, isAllowedClaudeModel } from '../config/anthropic.js';
const router = Router();
function getClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
        return null;
    return new Anthropic({ apiKey });
}
router.get('/status', async (_req, res) => {
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    res.json({
        status: 'success',
        data: {
            sdk: '@anthropic-ai/sdk',
            apiKeyConfigured: hasKey,
            defaultModel: DEFAULT_CLAUDE_MODEL,
            allowedModels: ALLOWED_CLAUDE_MODELS,
        },
    });
});
router.get('/models', async (_req, res) => {
    res.json({ status: 'success', data: { allowed: ALLOWED_CLAUDE_MODELS, default: DEFAULT_CLAUDE_MODEL } });
});
router.post('/validate-model', async (req, res) => {
    const { model } = req.body || {};
    if (!model || typeof model !== 'string') {
        return res.status(400).json({
            status: 'error',
            error: { code: ErrorCode.INVALID_REQUEST, message: 'model is required' },
        });
    }
    const allowed = isAllowedClaudeModel(model);
    res.json({ status: 'success', data: { model, allowed } });
});
router.post('/chat', async (req, res) => {
    try {
        const client = getClient();
        if (!client) {
            return res.status(400).json({
                status: 'error',
                error: { code: ErrorCode.AUTH_FAILED, message: 'ANTHROPIC_API_KEY not configured' },
            });
        }
        const { prompt, model = DEFAULT_CLAUDE_MODEL, max_tokens = 128 } = req.body || {};
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                status: 'error',
                error: { code: ErrorCode.INVALID_REQUEST, message: 'prompt is required' },
            });
        }
        if (!isAllowedClaudeModel(model)) {
            return res.status(400).json({
                status: 'error',
                error: { code: ErrorCode.INVALID_REQUEST, message: `Model '${model}' is not allowed` },
            });
        }
        const response = await client.messages.create({
            model,
            max_tokens,
            messages: [{ role: 'user', content: prompt }],
        });
        res.json({ status: 'success', data: response });
    }
    catch (error) {
        console.error('Anthropic chat error:', error);
        res.status(500).json({
            status: 'error',
            error: { code: ErrorCode.INTERNAL_ERROR, message: 'Anthropic request failed' },
        });
    }
});
export { router as anthropicRouter };
//# sourceMappingURL=anthropic.js.map
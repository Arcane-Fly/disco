import { Router } from 'express';

const router = Router();

router.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

export default router;
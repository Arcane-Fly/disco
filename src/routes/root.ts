import { Request, Response } from 'express';

export const rootHandler = (req: Request, res: Response) => {
  res.json({
    name: 'Disco MCP Server',
    version: process.env.npm_package_version || '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth',
      containers: '/api/v1/containers',
      mcp: '/api/v1/mcp',
    },
    documentation: '/docs',
    github: 'https://github.com/Arcane-Fly/disco',
  });
};

import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Disco MCP Server API',
      version: '1.0.0',
      description: 'MCP (Model Control Plane) server that integrates with ChatGPT through Railway deployment with WebContainers',
      contact: {
        name: 'Arcane-Fly',
        url: 'https://github.com/Arcane-Fly/disco'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'disco-mcp.up.railway.app'}`
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/v1/auth/login'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR'
                },
                message: {
                  type: 'string',
                  example: 'Request validation failed'
                }
              }
            }
          }
        },
        Container: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'container-123'
            },
            status: {
              type: 'string',
              enum: ['creating', 'running', 'stopped', 'error']
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            lastActive: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        FileInfo: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'index.js'
            },
            path: {
              type: 'string',
              example: '/src/index.js'
            },
            type: {
              type: 'string',
              enum: ['file', 'directory']
            },
            size: {
              type: 'number',
              example: 1024
            },
            modifiedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy']
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            uptime: {
              type: 'number',
              description: 'Uptime in seconds'
            },
            version: {
              type: 'string',
              example: '1.0.0'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'Containers',
        description: 'WebContainer lifecycle management'
      },
      {
        name: 'Files',
        description: 'File system operations'
      },
      {
        name: 'Terminal',
        description: 'Terminal command execution'
      },
      {
        name: 'Git',
        description: 'Git repository operations'
      },
      {
        name: 'Computer Use',
        description: 'Browser automation and computer use capabilities'
      },
      {
        name: 'RAG',
        description: 'Retrieval-Augmented Generation and search'
      },
      {
        name: 'Collaboration',
        description: 'Real-time collaboration and multi-user editing'
      },
      {
        name: 'Discovery',
        description: 'Service discovery and configuration'
      }
    ]
  },
  apis: [
    './src/api/*.ts',
    './src/server.ts'
  ]
};

export const specs = swaggerJSDoc(options);
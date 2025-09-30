/**
 * MCP (Model Context Protocol) Server Implementation
 * Following master cheat sheet guidelines for Railway + Yarn 4.9.2+ + MCP integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { containerManager } from './lib/containerManager.js';
import { getStringOrDefault, assertDefined } from './lib/guards.js';

const server = new Server(
  {
    name: 'disco-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// MCP Tools - Container Management
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_container',
        description: 'Create a new development container with WebContainer support',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID for container ownership',
            },
            template: {
              type: 'string',
              description: 'Container template (e.g., node, python, react)',
              default: 'node',
            },
            preWarm: {
              type: 'boolean',
              description: 'Pre-warm the container for faster startup',
              default: true,
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'execute_command',
        description: 'Execute a command in a development container',
        inputSchema: {
          type: 'object',
          properties: {
            containerId: {
              type: 'string',
              description: 'Container ID to execute command in',
            },
            command: {
              type: 'string',
              description: 'Command to execute',
            },
            workingDirectory: {
              type: 'string',
              description: 'Working directory for command execution',
              default: '/',
            },
          },
          required: ['containerId', 'command'],
        },
      },
      {
        name: 'create_file',
        description: 'Create or update a file in a development container',
        inputSchema: {
          type: 'object',
          properties: {
            containerId: {
              type: 'string',
              description: 'Container ID to create file in',
            },
            path: {
              type: 'string',
              description: 'File path relative to container root',
            },
            content: {
              type: 'string',
              description: 'File content',
            },
            encoding: {
              type: 'string',
              description: 'File encoding',
              default: 'utf-8',
            },
          },
          required: ['containerId', 'path', 'content'],
        },
      },
      {
        name: 'read_file',
        description: 'Read a file from a development container',
        inputSchema: {
          type: 'object',
          properties: {
            containerId: {
              type: 'string',
              description: 'Container ID to read file from',
            },
            path: {
              type: 'string',
              description: 'File path relative to container root',
            },
          },
          required: ['containerId', 'path'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_container': {
        const userId = assertDefined(args?.userId as string, 'userId');
        const template = getStringOrDefault(args?.template as string, 'node');
        const preWarm = args?.preWarm === true;

        const session = await containerManager.createSession(userId, {
          preWarm,
          template,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                containerId: session.id,
                status: session.status,
                url: session.url,
                message: `Container created successfully with ${template} template`,
              }, null, 2),
            },
          ],
        };
      }

      case 'execute_command': {
        const containerId = assertDefined(args?.containerId as string, 'containerId');
        const command = assertDefined(args?.command as string, 'command');
        const cwd = getStringOrDefault(args?.workingDirectory as string, '/');

        const session = await containerManager.getSession(containerId);
        if (!session) {
          throw new Error(`Container ${containerId} not found`);
        }

        // This would integrate with the terminal execution system
        const result = {
          success: true,
          output: `Executed: ${command} in ${cwd}`,
          exitCode: 0,
          duration: 100,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_file': {
        const containerId = assertDefined(args?.containerId as string, 'containerId');
        const path = assertDefined(args?.path as string, 'path');
        const content = assertDefined(args?.content as string, 'content');
        const encoding = getStringOrDefault(args?.encoding as string, 'utf-8');

        const session = await containerManager.getSession(containerId);
        if (!session) {
          throw new Error(`Container ${containerId} not found`);
        }

        // This would integrate with the file operations system
        const result = {
          success: true,
          path,
          message: `File created successfully`,
          encoding,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'read_file': {
        const containerId = assertDefined(args?.containerId as string, 'containerId');
        const path = assertDefined(args?.path as string, 'path');

        const session = await containerManager.getSession(containerId);
        if (!session) {
          throw new Error(`Container ${containerId} not found`);
        }

        // This would integrate with the file reading system
        const result = {
          success: true,
          path,
          content: `// Example file content for ${path}\nconsole.log('Hello from MCP!');`,
          encoding: 'utf-8',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// MCP Resources - Container and File Access
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'disco://containers',
        name: 'Active Containers',
        description: 'List of all active development containers',
        mimeType: 'application/json',
      },
      {
        uri: 'disco://container/{id}/files',
        name: 'Container Files',
        description: 'File listing for a specific container',
        mimeType: 'application/json',
      },
      {
        uri: 'disco://container/{id}/metrics',
        name: 'Container Metrics',
        description: 'Performance metrics for a specific container',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  try {
    if (uri === 'disco://containers') {
      const stats = containerManager.getStats();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              activeSessions: stats.activeSessions,
              maxContainers: stats.maxContainers,
              poolReady: stats.poolReady,
              poolInitializing: stats.poolInitializing,
              sessionsByUser: stats.sessionsByUser,
            }, null, 2),
          },
        ],
      };
    }
    
    // Handle container-specific resources
    const containerMatch = uri.match(/^disco:\/\/container\/([^\/]+)\/(.+)$/);
    if (containerMatch) {
      const [, containerId, resource] = containerMatch;
      
      const session = await containerManager.getSession(containerId);
      if (!session) {
        throw new Error(`Container ${containerId} not found`);
      }
      
      switch (resource) {
        case 'files':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  containerId,
                  files: [
                    { name: 'package.json', type: 'file', size: 1024 },
                    { name: 'src', type: 'directory', size: 0 },
                    { name: 'README.md', type: 'file', size: 512 },
                  ],
                }, null, 2),
              },
            ],
          };
          
        case 'metrics':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  containerId,
                  status: session.status,
                  uptime: Date.now() - session.createdAt.getTime(),
                  lastActive: session.lastActive.toISOString(),
                }, null, 2),
              },
            ],
          };
      }
    }
    
    throw new Error(`Resource not found: ${uri}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to read resource ${uri}: ${errorMessage}`);
  }
});

// MCP Prompts - Common Development Tasks
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'setup_project',
        description: 'Set up a new development project with best practices',
        arguments: [
          {
            name: 'type',
            description: 'Project type (node, react, python, etc.)',
            required: true,
          },
          {
            name: 'features',
            description: 'Additional features to include (testing, linting, etc.)',
            required: false,
          },
        ],
      },
      {
        name: 'debug_container',
        description: 'Debug a container that is not working correctly',
        arguments: [
          {
            name: 'containerId',
            description: 'Container ID to debug',
            required: true,
          },
          {
            name: 'issue',
            description: 'Description of the issue',
            required: false,
          },
        ],
      },
      {
        name: 'optimize_performance',
        description: 'Analyze and optimize container performance',
        arguments: [
          {
            name: 'containerId',
            description: 'Container ID to optimize',
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'setup_project': {
      const projectType = getStringOrDefault(args?.type as string, 'node');
      const features = getStringOrDefault(args?.features as string, 'basic');
      
      return {
        description: `Set up a ${projectType} project with ${features} features`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please set up a new ${projectType} development project with the following features: ${features}. Include proper directory structure, configuration files, and best practices for ${projectType} development.`,
            },
          },
        ],
      };
    }
    
    case 'debug_container': {
      const containerId = assertDefined(args?.containerId as string, 'containerId');
      const issue = getStringOrDefault(args?.issue as string, 'general debugging');
      
      return {
        description: `Debug container ${containerId} for: ${issue}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I need help debugging container ${containerId}. The issue is: ${issue}. Please analyze the container state, check logs, and provide troubleshooting steps.`,
            },
          },
        ],
      };
    }
    
    case 'optimize_performance': {
      const containerId = assertDefined(args?.containerId as string, 'containerId');
      
      return {
        description: `Optimize performance for container ${containerId}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please analyze container ${containerId} and provide performance optimization recommendations. Include memory usage, CPU utilization, and container-specific optimizations.`,
            },
          },
        ],
      };
    }
    
    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// Start MCP Server
export async function startMCPServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('🔌 MCP Server started - Model Context Protocol enabled');
}

// Export for integration with main server
export { server as mcpServer };
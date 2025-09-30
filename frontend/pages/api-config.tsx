import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Key, Copy, CheckCircle, AlertTriangle, Code, ExternalLink } from 'lucide-react';

export default function ApiConfig() {
  const { user, token } = useAuth();
  const [mcpUrl, setMcpUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentToken, setCurrentToken] = useState('');

  useEffect(() => {
    // Get token from auth context or cookies
    const getToken = () => {
      if (token) return token;
      
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'auth-token') {
            return value;
          }
        }
      }
      return '';
    };

    const authToken = getToken();
    setCurrentToken(authToken);
    
    if (authToken) {
      // Generate the MCP URL with token parameter similar to Tavily
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://disco-mcp.up.railway.app'
        : window.location.origin;
      setMcpUrl(`${baseUrl}/mcp?token=${authToken}`);
    }
  }, [token]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Authentication Required
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Please sign in to access your API configuration
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              API Configuration
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Generate and manage your MCP server connection URLs and API keys
            </p>
          </div>

          {/* MCP URL Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Key className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                MCP Server URL
              </h2>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Use this URL in your MCP client (Claude, ChatGPT, etc.) to connect to your Disco MCP server.
                Similar to Tavily&apos;s MCP URL format.
              </p>
              
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={mcpUrl}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => copyToClipboard(mcpUrl)}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-1 ${
                    copied
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex items-start">
                <Code className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Usage Instructions
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Copy the URL above</li>
                    <li>• Paste it into your MCP client configuration</li>
                    <li>• The URL includes your authentication token for secure access</li>
                    <li>• No additional authentication setup required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bearer Token Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Key className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Bearer Token (Alternative)
              </h2>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                For clients that prefer Bearer token authentication, use this token in the Authorization header.
              </p>
              
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="password"
                    value={currentToken}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => copyToClipboard(currentToken)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <div className="flex items-start">
                <Code className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-1">
                    Bearer Token Usage
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    Include this header in your HTTP requests:
                  </p>
                  <code className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Authorization: Bearer {currentToken?.substring(0, 20)}...
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Transport Configuration */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Key className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Transport Configuration
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* MCP HTTP Stream */}
              <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">MCP HTTP Stream</h3>
                  <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">Recommended</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Modern streaming protocol for ChatGPT and compatible clients.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 mb-3">
                  <code className="text-xs font-mono text-green-800 dark:text-green-200">
                    {mcpUrl}
                  </code>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <strong>Best for:</strong> ChatGPT, Claude Desktop, modern MCP clients
                </p>
              </div>

              {/* Legacy SSE */}
              <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Legacy SSE Transport</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Server-Sent Events for older clients that need streaming.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3 mb-3">
                  <code className="text-xs font-mono text-yellow-800 dark:text-yellow-200">
                    {mcpUrl.replace('/mcp', '/sse')}
                  </code>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <strong>Best for:</strong> Legacy integrations, older MCP clients
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Setup Examples */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <ExternalLink className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Setup Examples
              </h2>
            </div>

            <div className="space-y-6">
              {/* ChatGPT Setup */}
              <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">GPT</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">ChatGPT Configuration</h3>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Steps:</h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
                    <li>Open ChatGPT and go to Settings → Beta Features</li>
                    <li>Enable &quot;Model Context Protocol&quot; if available</li>
                    <li>Add a new MCP server connection</li>
                    <li>Paste the MCP URL: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">{mcpUrl}</code></li>
                    <li>Give it a name like &quot;Disco MCP Server&quot;</li>
                    <li>Test the connection</li>
                  </ol>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Note:</strong> MCP integration in ChatGPT may require ChatGPT Plus subscription and may be in beta.
                </div>
              </div>

              {/* Claude Desktop Setup */}
              <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">C</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Claude Desktop Configuration</h3>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Configuration File:</h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                    Add this to your Claude Desktop configuration file:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "disco-mcp": {
      "command": "npx",
      "args": ["@disco/mcp-client"],
      "env": {
        "DISCO_MCP_URL": "${mcpUrl}",
        "DISCO_TOKEN": "${currentToken?.substring(0, 20)}..."
      }
    }
  }
}`}
                  </pre>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Location:</strong> <code>~/.config/claude/config.json</code> (macOS/Linux) or <code>%APPDATA%/claude/config.json</code> (Windows)
                </div>
              </div>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <ExternalLink className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Documentation & Resources
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="/docs"
                className="block p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">API Documentation</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Complete API reference and examples
                </p>
              </a>
              
              <a
                href="https://platform.openai.com/docs/guides/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">OpenAI MCP Guide</h3>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Official OpenAI guide for MCP server integration
                </p>
              </a>
              
              <a
                href="/claude-connector"
                className="block p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Claude.ai Setup</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Configuration for Claude.ai integration
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  AlertTriangle,
  Copy,
  ExternalLink,
  Key,
  Terminal,
  Code,
  Loader2
} from 'lucide-react';

const TOKEN_MASK_LENGTH = 24;

type CopyTarget = 'mcp' | 'token' | null;

const maskToken = (value: string) => {
  if (!value) return 'Not available';
  if (value.length <= TOKEN_MASK_LENGTH) return value;
  return `${value.substring(0, TOKEN_MASK_LENGTH)}…`;
};

export default function ApiConfig() {
  const { user, token } = useAuth();
  const [mcpUrl, setMcpUrl] = useState('');
  const [currentToken, setCurrentToken] = useState('');
  const [copied, setCopied] = useState<CopyTarget>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const resolveToken = () => {
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

    const initialise = async () => {
      setIsGenerating(true);
      const resolvedToken = resolveToken();
      setCurrentToken(resolvedToken);

      if (resolvedToken) {
        const baseUrl = typeof window === 'undefined'
          ? 'https://disco-mcp.up.railway.app'
          : process.env.NODE_ENV === 'production'
            ? 'https://disco-mcp.up.railway.app'
            : window.location.origin;

        setMcpUrl(`${baseUrl}/mcp?token=${resolvedToken}`);
      } else {
        setMcpUrl('');
      }

      setIsGenerating(false);
    };

    void initialise();
  }, [token]);

  const copyToClipboard = async (value: string, target: CopyTarget) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
      setTimeout(() => setCopied((prev) => (prev === target ? null : prev)), 1600);
    } catch (error) {
      console.warn('Clipboard copy failed, falling back to legacy behaviour', error);
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(target);
      setTimeout(() => setCopied((prev) => (prev === target ? null : prev)), 1600);
    }
  };

  if (!user) {
    return (
      <Layout>
        <section className="page-section">
          <div className="container">
            <Card variant="elevated" className="max-w-lg mx-auto text-center space-y-6">
              <div className="flex justify-center">
                <div className="status-pill status-pill--warning">
                  <AlertTriangle className="w-4 h-4" />
                  Authentication required
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-text-primary">Sign in to manage your API configuration</h2>
              <p className="text-text-secondary">
                Connect your account to generate a secure MCP server URL and bearer token. These credentials are required for integrating Disco MCP with your preferred client.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="justify-center"
              >
                Return to landing page
              </Button>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="page-section">
        <div className="container space-y-8">
          <header className="page-header">
            <h1 className="page-header__title">API Configuration</h1>
            <p className="page-header__description">
              Generate and manage secure connection details for Disco MCP. Use these tokens to connect ChatGPT, Claude, or any MCP-compatible client.
            </p>
          </header>

          <Card variant="elevated" className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[color-mix(in_oklab,var(--brand-cyan)_18%,transparent)] text-brand-cyan p-2">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">MCP Server URL</h2>
                  <p className="text-sm text-text-secondary">Use this URL in MCP clients such as Claude Desktop or ChatGPT.</p>
                </div>
              </div>
              {copied === 'mcp' && (
                <span className="status-pill status-pill--success">Copied</span>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <input
                  readOnly
                  value={mcpUrl || 'Generating secure URL…'}
                  className="form-input font-mono text-sm"
                  aria-label="MCP server URL"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => copyToClipboard(mcpUrl, 'mcp')}
                disabled={!mcpUrl || isGenerating}
                className="whitespace-nowrap"
                leftIcon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              >
                {isGenerating ? 'Preparing…' : copied === 'mcp' ? 'Copied!' : 'Copy URL'}
              </Button>
            </div>

            <div className="callout callout--info space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Code className="w-4 h-4" />
                Usage instructions
              </div>
              <ul className="space-y-1 text-sm">
                <li>• Copy the MCP server URL above.</li>
                <li>• Paste it into your MCP client configuration.</li>
                <li>• The URL already includes your authentication token.</li>
                <li>• No additional authentication steps are required.</li>
              </ul>
            </div>
          </Card>

          <Card variant="elevated" className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-success p-2">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Bearer Token (Alternative)</h2>
                  <p className="text-sm text-text-secondary">Use this token in an <code className="px-2 py-1 rounded bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] border border-border-subtle">Authorization</code> header.</p>
                </div>
              </div>
              {copied === 'token' && (
                <span className="status-pill status-pill--success">Copied</span>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <input
                  type="password"
                  readOnly
                  value={currentToken}
                  className="form-input font-mono text-sm"
                  aria-label="Bearer token"
                />
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => copyToClipboard(currentToken, 'token')}
                disabled={!currentToken || isGenerating}
                leftIcon={<Copy className="w-4 h-4" />}
                className="whitespace-nowrap"
              >
                {copied === 'token' ? 'Token copied' : 'Copy token'}
              </Button>
            </div>

            <div className="callout callout--success text-sm">
              Include this header in HTTP requests:
              <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-lg border border-[color-mix(in_oklab,var(--success)_28%,transparent)] bg-[color-mix(in_oklab,var(--success)_8%,transparent)] px-3 py-2 font-mono text-xs text-success">
                Authorization: Bearer {maskToken(currentToken)}
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[color-mix(in_oklab,var(--brand-purple)_18%,transparent)] text-brand-purple p-2">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Transport configuration</h2>
                <p className="text-sm text-text-secondary">Choose the streaming transport that matches your MCP client.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card variant="interactive" className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="status-pill status-pill--success">Recommended</span>
                  <span className="text-sm text-text-secondary">Modern streaming for ChatGPT & Claude</span>
                </div>
                <div className="font-semibold text-text-primary">MCP HTTP Stream</div>
                <div className="rounded-lg border border-border-subtle bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] p-3 font-mono text-xs text-text-secondary break-all">
                  {mcpUrl || 'Preparing secure endpoint…'}
                </div>
                <p className="text-xs text-text-muted">
                  Ideal for the latest MCP integrations with full duplex streaming.
                </p>
              </Card>

              <Card variant="interactive" className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="status-pill status-pill--warning">Legacy</span>
                  <span className="text-sm text-text-secondary">For older SSE-based clients</span>
                </div>
                <div className="font-semibold text-text-primary">Legacy SSE Transport</div>
                <div className="rounded-lg border border-border-subtle bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] p-3 font-mono text-xs text-text-secondary break-all">
                  {mcpUrl ? mcpUrl.replace('/mcp', '/sse') : 'Preparing SSE endpoint…'}
                </div>
                <p className="text-xs text-text-muted">
                  Fallback for legacy tooling that expects Server-Sent Events.
                </p>
              </Card>
            </div>
          </Card>

          <Card variant="elevated" className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[color-mix(in_oklab,var(--brand-cyan)_18%,transparent)] text-brand-cyan p-2">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Setup examples</h2>
                <p className="text-sm text-text-secondary">Follow the guides below to connect Disco MCP to your preferred client.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card variant="default" className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--brand-cyan)_18%,transparent)] text-brand-cyan font-semibold">
                    GPT
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">ChatGPT configuration</h3>
                    <p className="text-sm text-text-secondary">Add the MCP server in ChatGPT labs or beta settings.</p>
                  </div>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
                  <li>Open ChatGPT → Settings → Labs (or Beta).</li>
                  <li>Enable Model Context Protocol.</li>
                  <li>Add a new MCP server and paste the URL above.</li>
                  <li>Name it <span className="font-medium text-text-primary">Disco MCP Server</span> and test the connection.</li>
                </ol>
                <div className="callout text-xs">
                  ChatGPT MCP support is currently available for Plus users in preview.
                </div>
              </Card>

              <Card variant="default" className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--brand-purple)_18%,transparent)] text-brand-purple font-semibold">
                    C
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Claude desktop configuration</h3>
                    <p className="text-sm text-text-secondary">Add Disco MCP to the Claude Desktop configuration file.</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border-subtle bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] p-4 text-xs text-text-secondary font-mono overflow-x-auto">
{`{
  "mcpServers": {
    "disco-mcp": {
      "command": "npx",
      "args": ["@disco/mcp-client"],
      "env": {
        "DISCO_MCP_URL": "${mcpUrl || '<pending>'}",
        "DISCO_TOKEN": "${maskToken(currentToken)}"
      }
    }
  }
}`}
                </div>
                <p className="text-xs text-text-muted">
                  macOS / Linux: <code>~/.config/claude/config.json</code> · Windows: <code>%APPDATA%/claude/config.json</code>
                </p>
              </Card>
            </div>
          </Card>

          <Card variant="elevated" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[color-mix(in_oklab,var(--brand-purple)_18%,transparent)] text-brand-purple p-2">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Documentation & resources</h2>
                <p className="text-sm text-text-secondary">Deep dive into Disco MCP and Model Context Protocol best practices.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="/docs"
                className="card card--interactive block h-full space-y-2"
              >
                <h3 className="text-base font-semibold text-text-primary">API documentation</h3>
                <p className="text-sm text-text-secondary">Complete reference, authentication flow, and endpoint samples.</p>
              </a>

              <a
                href="https://platform.openai.com/docs/guides/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="card card--interactive block h-full space-y-2"
              >
                <div className="flex items-center justify-between text-text-secondary">
                  <h3 className="text-base font-semibold text-text-primary">OpenAI MCP guide</h3>
                  <ExternalLink className="w-4 h-4" />
                </div>
                <p className="text-sm text-text-secondary">Official guidance from OpenAI for MCP server integration.</p>
              </a>

              <a
                href="/claude-connector"
                className="card card--interactive block h-full space-y-2"
              >
                <h3 className="text-base font-semibold text-text-primary">Claude.ai setup</h3>
                <p className="text-sm text-text-secondary">Step-by-step instructions for Anthropic&apos;s desktop client.</p>
              </a>
            </div>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

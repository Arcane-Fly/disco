import React from 'react';
import Link from 'next/link';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border-subtle bg-bg-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h4 className="font-semibold text-text-primary">Disco MCP Server</h4>
              <p className="text-sm text-text-secondary">Model Context Protocol Development Platform</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-text-primary">Resources</h4>
              <div className="flex flex-col gap-1">
                <a href="/mcp-manifest.json" className="text-sm text-text-secondary hover:text-text-primary transition-colors">MCP Manifest</a>
                <a href="/health" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Health Status</a>
                <a href="https://github.com/Arcane-Fly/disco" className="text-sm text-text-secondary hover:text-text-primary transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-text-primary">Interfaces</h4>
              <div className="flex flex-col gap-1">
                <Link href="/app-dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Dashboard</Link>
                <Link href="/workflow-builder" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Workflow Builder</Link>
                <Link href="/analytics" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Analytics</Link>
                <Link href="/webcontainer-loader" className="text-sm text-text-secondary hover:text-text-primary transition-colors">WebContainer</Link>
                <Link href="/legacy-root" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Classic UI</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border-subtle text-center">
            <p className="text-sm text-text-tertiary">© 2025 Disco MCP. Built with Next.js and WebContainers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
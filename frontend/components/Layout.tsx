import React from 'react';
import Link from 'next/link';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Disco MCP Server</h4>
              <p>Model Context Protocol Development Platform</p>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <a href="/mcp-manifest.json">MCP Manifest</a>
              <a href="/health">Health Status</a>
              <a href="https://github.com/Arcane-Fly/disco">GitHub</a>
            </div>
            <div className="footer-section">
              <h4>Interfaces</h4>
              <Link href="/app-dashboard">Dashboard</Link>
              <Link href="/workflow-builder">Workflow Builder</Link>
              <Link href="/analytics">Analytics</Link>
              <Link href="/webcontainer-loader">WebContainer</Link>
              <Link href="/legacy-root">Classic UI</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Disco MCP. Built with Next.js and WebContainers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
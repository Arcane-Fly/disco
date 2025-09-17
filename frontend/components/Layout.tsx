import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-layout">
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
              <a href="/app-dashboard">Dashboard</a>
              <a href="/workflow-builder">Workflow Builder</a>
              <a href="/analytics">Analytics</a>
              <a href="/webcontainer-loader">WebContainer</a>
              <a href="/legacy-root">Classic UI</a>
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
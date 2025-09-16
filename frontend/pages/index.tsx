import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { 
  Code2, 
  Github, 
  Cpu, 
  Globe, 
  Zap, 
  Shield, 
  Users, 
  BarChart3,
  Terminal,
  ArrowRight,
  Check
} from 'lucide-react';

export default function Home() {
  const { user, login } = useAuth();

  const features = [
    {
      icon: <Terminal className="w-6 h-6" />,
      title: "WebContainer IDE",
      description: "Full-featured browser-based development environment with terminal access"
    },
    {
      icon: <Github className="w-6 h-6" />,
      title: "GitHub Integration",
      description: "Seamless repository management and version control"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "MCP Protocol",
      description: "Model Context Protocol compliant server for AI integrations"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Real-time monitoring and performance optimization"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure by Design",
      description: "SOC 2 Type II ready with enterprise-grade security"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Real-time collaboration tools for development teams"
    }
  ];

  const capabilities = [
    "Container orchestration",
    "Browser automation",
    "RAG implementation",
    "Computer use API",
    "File system management",
    "Git operations",
    "Performance monitoring",
    "Security compliance"
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap className="w-4 h-4" />
              <span>MCP-Compliant Development Platform</span>
            </div>
            
            <h1 className="hero-title">
              Build, Deploy & Collaborate
              <span className="hero-gradient">Without Limits</span>
            </h1>
            
            <p className="hero-description">
              Disco MCP Server provides a complete WebContainer-based development environment 
              with Model Context Protocol support, enabling seamless AI integration and 
              cloud-native development workflows.
            </p>

            <div className="hero-actions">
              {user ? (
                <>
                  <Link href="/dashboard" className="btn btn-primary">
                    <BarChart3 className="w-5 h-5" />
                    Open Dashboard
                  </Link>
                  <Link href="/webcontainer-loader" className="btn btn-secondary">
                    <Code2 className="w-5 h-5" />
                    Launch IDE
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={login} className="btn btn-primary">
                    <Github className="w-5 h-5" />
                    Sign in with GitHub
                  </button>
                  <Link href="/legacy-root" className="btn btn-secondary">
                    <Globe className="w-5 h-5" />
                    Explore Demo
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">50+</div>
                <div className="stat-label">Container Limit</div>
              </div>
              <div className="stat">
                <div className="stat-value">10x</div>
                <div className="stat-label">Performance</div>
              </div>
              <div className="stat">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Platform Features</h2>
            <p className="section-description">
              Everything you need for modern cloud development
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="capabilities-section">
        <div className="container">
          <div className="capabilities-content">
            <div className="capabilities-info">
              <h2 className="section-title">Full-Stack Capabilities</h2>
              <p className="section-description">
                Built for developers who need powerful, integrated tools for 
                modern application development and AI integration.
              </p>
              
              <div className="capabilities-list">
                {capabilities.map((capability, index) => (
                  <div key={index} className="capability-item">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{capability}</span>
                  </div>
                ))}
              </div>

              {user ? (
                <Link href="/dashboard" className="btn btn-primary">
                  View Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button onClick={login} className="btn btn-primary">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="capabilities-visual">
              <div className="code-block">
                <div className="code-header">
                  <span className="code-dot red"></span>
                  <span className="code-dot yellow"></span>
                  <span className="code-dot green"></span>
                </div>
                <pre className="code-content">
{`// Initialize Disco MCP Server
import { DiscoMCP } from '@disco/mcp';

const server = new DiscoMCP({
  webcontainer: true,
  github: process.env.GITHUB_TOKEN,
  redis: process.env.REDIS_URL
});

// Create development container
const container = await server.createContainer({
  template: 'node-typescript',
  resources: { cpu: 2, memory: 4096 }
});

// Launch WebContainer IDE
await container.launch();`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Development Workflow?</h2>
            <p className="cta-description">
              Join developers using Disco MCP for AI-powered development
            </p>
            <div className="cta-actions">
              {user ? (
                <Link href="/webcontainer-loader" className="btn btn-large">
                  Launch Development Environment
                </Link>
              ) : (
                <button onClick={login} className="btn btn-large">
                  <Github className="w-6 h-6" />
                  Start Building with GitHub
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

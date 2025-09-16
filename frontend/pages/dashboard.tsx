import React from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3,
  Activity,
  Users,
  Zap,
  Server,
  Database,
  Clock,
  Shield
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const metrics = [
    {
      title: "Active Containers",
      value: "5",
      description: "Currently running",
      icon: <Server className="w-6 h-6" />
    },
    {
      title: "CPU Usage",
      value: "42%",
      description: "Average across all containers",
      icon: <Activity className="w-6 h-6" />
    },
    {
      title: "Memory Usage",
      value: "2.1 GB",
      description: "Total allocated memory",
      icon: <Database className="w-6 h-6" />
    },
    {
      title: "Uptime",
      value: "99.9%",
      description: "Last 30 days",
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: "API Requests",
      value: "1,247",
      description: "Today",
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Active Sessions",
      value: "12",
      description: "Connected users",
      icon: <Users className="w-6 h-6" />
    },
    {
      title: "Security Score",
      value: "A+",
      description: "SOC 2 compliant",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "Performance",
      value: "Fast",
      description: "Response time < 100ms",
      icon: <Zap className="w-6 h-6" />
    }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="dashboard">
          <div className="container">
            <div className="dashboard-header">
              <h1 className="dashboard-title">
                Welcome back, {user?.username || user?.name}!
              </h1>
              <p className="dashboard-subtitle">
                Here's an overview of your Disco MCP Server instance
              </p>
            </div>

            <div className="dashboard-grid">
              {metrics.map((metric, index) => (
                <div key={index} className="metric-card">
                  <div className="metric-header">
                    <span className="metric-title">{metric.title}</span>
                    <div className="metric-icon">{metric.icon}</div>
                  </div>
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-description">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
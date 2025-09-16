import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  BarChart3,
  Activity,
  Users,
  Zap,
  Server,
  Database,
  Clock,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { connected, metrics } = useWebSocket();
  const { addNotification } = useNotifications();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionNotified, setConnectionNotified] = useState(false);

  useEffect(() => {
    if (metrics) {
      setLastUpdate(new Date());
    }
  }, [metrics]);

  useEffect(() => {
    if (connected && !connectionNotified) {
      addNotification({
        type: 'success',
        title: 'Real-time Updates Connected',
        message: 'Dashboard is now receiving live metrics updates.',
        duration: 3000
      });
      setConnectionNotified(true);
    } else if (!connected && connectionNotified) {
      addNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'Real-time updates disconnected. Showing cached data.',
        duration: 5000
      });
      setConnectionNotified(false);
    }
  }, [connected, connectionNotified, addNotification]);

  // Default static metrics (fallback when no real-time data)
  const defaultMetrics = [
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

  // Use real-time metrics if available, otherwise use defaults
  const displayMetrics = metrics ? [
    {
      title: "Active Containers",
      value: metrics.activeContainers.toString(),
      description: "Currently running",
      icon: <Server className="w-6 h-6" />
    },
    {
      title: "CPU Usage",
      value: `${metrics.cpuUsage}%`,
      description: "Average across all containers",
      icon: <Activity className="w-6 h-6" />
    },
    {
      title: "Memory Usage",
      value: metrics.memoryUsage,
      description: "Total allocated memory",
      icon: <Database className="w-6 h-6" />
    },
    {
      title: "Uptime",
      value: metrics.uptime,
      description: "Last 30 days",
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: "API Requests",
      value: metrics.apiRequests.toLocaleString(),
      description: "Today",
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Active Sessions",
      value: metrics.activeSessions.toString(),
      description: "Connected users",
      icon: <Users className="w-6 h-6" />
    },
    {
      title: "Security Score",
      value: metrics.securityScore,
      description: "SOC 2 compliant",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "Performance",
      value: metrics.performance,
      description: "Response time < 100ms",
      icon: <Zap className="w-6 h-6" />
    }
  ] : defaultMetrics;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="dashboard">
          <div className="container">
            <div className="dashboard-header">
              <div className="dashboard-title-section">
                <h1 className="dashboard-title">
                  Welcome back, {user?.username || user?.name}!
                </h1>
                <p className="dashboard-subtitle">
                  Here's an overview of your Disco MCP Server instance
                </p>
              </div>
              <div className="dashboard-status">
                <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                  {connected ? (
                    <>
                      <Wifi className="w-5 h-5" />
                      <span>Live Updates</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-5 h-5" />
                      <span>Offline</span>
                    </>
                  )}
                </div>
                {lastUpdate && (
                  <div className="last-update">
                    <RefreshCw className="w-4 h-4" />
                    <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-grid">
              {displayMetrics.map((metric, index) => (
                <div key={index} className={`metric-card ${connected ? 'live' : ''}`}>
                  <div className="metric-header">
                    <span className="metric-title">{metric.title}</span>
                    <div className="metric-icon">{metric.icon}</div>
                  </div>
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-description">{metric.description}</div>
                  {connected && (
                    <div className="metric-live-indicator">
                      <div className="pulse-dot"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
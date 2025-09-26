import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNotifications } from '../contexts/NotificationContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import DemoBanner from '../components/DemoBanner';
import { 
  Users, 
  Activity, 
  Server,
  Cpu,
  HardDrive,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { connected, metrics } = useWebSocket();
  const { addNotification } = useNotifications();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (connected && user) {
      addNotification({
        type: 'success',
        title: 'WebSocket Connected',
        message: 'Real-time updates are now active'
      });
    }
  }, [connected, addNotification, user]);

  const handleQuickAction = (action: string) => {
    if (user) {
      addNotification({
        type: 'info',
        title: 'Action Started',
        message: `${action} has been initiated`
      });
    } else {
      addNotification({
        type: 'warning',
        title: 'Demo Mode',
        message: `${action} requires authentication. Please sign in to use this feature.`
      });
    }
  };

  return (
    <ProtectedRoute demoMode={true}>
      <Layout>
        <div className="dashboard">
          <div className="container">
            {/* Demo Banner for unauthenticated users */}
            {!user && (
              <DemoBanner 
                title="Dashboard"
                description="This is a demo version of the dashboard with sample data."
              />
            )}

            {/* Dashboard Header */}
            <div className="dashboard-header">
              <div className="dashboard-title-section">
                <h1 className="dashboard-title">
                  Welcome back, {user?.username || 'Demo User'}! 👋
                </h1>
                <p className="dashboard-subtitle">
                  Here&apos;s what&apos;s happening with your MCP server
                </p>
              </div>
              <div className="dashboard-status">
                <div className={`connection-status ${connected && user ? 'connected' : 'disconnected'}`}>
                  <div className="pulse-dot"></div>
                  <span>{connected && user ? 'Connected' : user ? 'Disconnected' : 'Demo Mode'}</span>
                </div>
                <div className="last-update">
                  <Clock className="w-4 h-4" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="dashboard-grid">
              <div className={`metric-card ${connected && user ? 'live' : ''}`}>
                <div className="metric-header">
                  <h3 className="metric-title">Active Containers</h3>
                  <Server className="metric-icon" />
                </div>
                <div className="metric-value">{metrics?.activeContainers || 7}</div>
                <p className="metric-description">
                  WebContainers currently running
                </p>
                {connected && user && <div className="metric-live-indicator"><div className="pulse-dot"></div></div>}
              </div>

              <div className={`metric-card ${connected && user ? 'live' : ''}`}>
                <div className="metric-header">
                  <h3 className="metric-title">CPU Usage</h3>
                  <Cpu className="metric-icon" />
                </div>
                <div className="metric-value">{metrics?.cpuUsage || 45}%</div>
                <p className="metric-description">
                  Average CPU utilization
                </p>
                {connected && user && <div className="metric-live-indicator"><div className="pulse-dot"></div></div>}
              </div>

              <div className={`metric-card ${connected && user ? 'live' : ''}`}>
                <div className="metric-header">
                  <h3 className="metric-title">Memory Usage</h3>
                  <HardDrive className="metric-icon" />
                </div>
                <div className="metric-value">{metrics?.memoryUsage || 62}%</div>
                <p className="metric-description">
                  System memory consumption
                </p>
                {connected && user && <div className="metric-live-indicator"><div className="pulse-dot"></div></div>}
              </div>

              <div className={`metric-card ${connected && user ? 'live' : ''}`}>
                <div className="metric-header">
                  <h3 className="metric-title">API Requests</h3>
                  <TrendingUp className="metric-icon" />
                </div>
                <div className="metric-value">{metrics?.apiRequests || '1.2K'}</div>
                <p className="metric-description">
                  Requests in the last hour
                </p>
                {connected && user && <div className="metric-live-indicator"><div className="pulse-dot"></div></div>}
              </div>

              {/* Quick Actions */}
              <div className="metric-card">
                <div className="metric-header">
                  <h3 className="metric-title">Quick Actions</h3>
                  <Zap className="metric-icon" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleQuickAction('Container Creation')}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <Server className="w-4 h-4" />
                    Create Container
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleQuickAction('Log Viewer')}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <Activity className="w-4 h-4" />
                    View Logs
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="metric-card">
                <div className="metric-header">
                  <h3 className="metric-title">Recent Activity</h3>
                  <Activity className="metric-icon" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                  {[
                    { action: 'Container deployed', time: '2m ago', type: 'success' },
                    { action: 'User registered', time: '5m ago', type: 'info' },
                    { action: 'System updated', time: '1h ago', type: 'warning' }
                  ].map((activity, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-xs)',
                      padding: 'var(--space-xs)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: activity.type === 'success' ? 'var(--success)' : 
                                   activity.type === 'info' ? 'var(--primary)' : '#f59e0b'
                      }}></div>
                      <span style={{ flex: 1, color: 'var(--white)' }}>{activity.action}</span>
                      <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Overview */}
              <div className="metric-card" style={{ gridColumn: '1 / -1' }}>
                <div className="metric-header">
                  <h3 className="metric-title">Platform Overview</h3>
                  <BarChart3 className="metric-icon" />
                </div>
                <p style={{ 
                  color: 'var(--gray-light)', 
                  marginBottom: 'var(--space-md)',
                  lineHeight: 1.6 
                }}>
                  {user 
                    ? "Welcome to your personalized dashboard with real-time data and full functionality."
                    : "This is a demo dashboard showing sample data. Sign in with GitHub to access your real data and full platform features."
                  }
                </p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 'var(--space-md)' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-sm)',
                    padding: 'var(--space-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Activity className="w-5 h-5" style={{ color: 'var(--primary-light)' }} />
                    <span style={{ color: 'var(--white)', fontSize: '0.875rem' }}>Recent Activity</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-sm)',
                    padding: 'var(--space-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Users className="w-5 h-5" style={{ color: 'var(--success)' }} />
                    <span style={{ color: 'var(--white)', fontSize: '0.875rem' }}>User Management</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-sm)',
                    padding: 'var(--space-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Shield className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
                    <span style={{ color: 'var(--white)', fontSize: '0.875rem' }}>Security & Compliance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

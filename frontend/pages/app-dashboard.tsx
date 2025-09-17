import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNotifications } from '../contexts/NotificationContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { MetricCard, PerformanceChart, UsageDistribution, ActivityChart } from '../components/ui/Analytics';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { 
  Users, 
  Activity, 
  Zap,
  Cpu,
  HardDrive,
  Clock,
  TrendingUp,
  Server,
  Shield,
  Rocket
} from 'lucide-react';

// Generate mock data for charts
const generatePerformanceData = () => {
  const data: Array<{
    time: string;
    cpu: number;
    memory: number;
    network: number;
  }> = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now - i * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.floor(Math.random() * 40) + 30,
      memory: Math.floor(Math.random() * 30) + 40,
      network: Math.floor(Math.random() * 100) + 50,
    });
  }
  return data;
};

const generateActivityData = () => {
  const data: Array<{
    date: string;
    requests: number;
    errors: number;
    users: number;
  }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      requests: Math.floor(Math.random() * 1000) + 500,
      errors: Math.floor(Math.random() * 50) + 10,
      users: Math.floor(Math.random() * 200) + 100,
    });
  }
  return data;
};

const usageDistributionData = [
  { name: 'WebContainers', value: 45, color: '#8b5cf6' },
  { name: 'API Requests', value: 25, color: '#06b6d4' },
  { name: 'File Operations', value: 20, color: '#10b981' },
  { name: 'Authentication', value: 10, color: '#f59e0b' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { connected, metrics } = useWebSocket();
  const { addNotification } = useNotifications();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [performanceData] = useState(generatePerformanceData);
  const [activityData] = useState(generateActivityData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (connected) {
      addNotification({
        type: 'success',
        title: 'WebSocket Connected',
        message: 'Real-time updates are now active'
      });
    }
  }, [connected, addNotification]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickAction = (action: string) => {
    addNotification({
      type: 'info',
      title: 'Action Started',
      message: `${action} has been initiated`
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.username || 'Developer'}! 👋
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    Here's what's happening with your MCP server
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    connected 
                      ? 'bg-green-500/20 text-green-100' 
                      : 'bg-red-500/20 text-red-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      connected ? 'bg-green-400' : 'bg-red-400'
                    } animate-pulse`}></div>
                    <span className="text-sm font-medium">
                      {connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-100">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-mono">
                      {currentTime.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Containers"
                value={metrics?.activeContainers || 7}
                change={{ value: 12, type: 'increase' }}
                icon={<Server className="w-6 h-6" />}
                className="hover:scale-105 transition-transform duration-200"
              />
              <MetricCard
                title="CPU Usage"
                value={`${metrics?.cpuUsage || 45}%`}
                change={{ value: 3, type: 'decrease' }}
                icon={<Cpu className="w-6 h-6" />}
                className="hover:scale-105 transition-transform duration-200"
              />
              <MetricCard
                title="Memory Usage"
                value={`${metrics?.memoryUsage || 62}%`}
                change={{ value: 8, type: 'increase' }}
                icon={<HardDrive className="w-6 h-6" />}
                className="hover:scale-105 transition-transform duration-200"
              />
              <MetricCard
                title="API Requests"
                value={metrics?.apiRequests || '1.2K'}
                change={{ value: 24, type: 'increase' }}
                icon={<TrendingUp className="w-6 h-6" />}
                className="hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart 
                data={performanceData}
                className="hover:shadow-lg transition-shadow duration-200"
              />
              <UsageDistribution 
                data={usageDistributionData}
                className="hover:shadow-lg transition-shadow duration-200"
              />
            </div>

            <ActivityChart 
              data={activityData}
              className="hover:shadow-lg transition-shadow duration-200"
            />

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => handleQuickAction('Container Creation')}
                    >
                      <Zap className="w-6 h-6" />
                      <span>Create Container</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => handleQuickAction('Log Viewer')}
                    >
                      <Activity className="w-6 h-6" />
                      <span>View Logs</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => handleQuickAction('User Management')}
                    >
                      <Users className="w-6 h-6" />
                      <span>Manage Users</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => handleQuickAction('Security Scan')}
                    >
                      <Shield className="w-6 h-6" />
                      <span>Security Scan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { 
                        action: 'Container deployed successfully',
                        time: '2 minutes ago',
                        type: 'success' as const
                      },
                      { 
                        action: 'New user registered',
                        time: '5 minutes ago',
                        type: 'info' as const
                      },
                      { 
                        action: 'System maintenance completed',
                        time: '1 hour ago',
                        type: 'warning' as const
                      },
                      { 
                        action: 'Security scan passed',
                        time: '2 hours ago',
                        type: 'success' as const
                      }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.type === 'success' ? 'bg-green-400' :
                          activity.type === 'info' ? 'bg-blue-400' :
                          activity.type === 'warning' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

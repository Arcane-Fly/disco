import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ProtectedRoute demoMode={true}>
      <Layout>
        <div className="space-y-6 p-6">
          {/* Demo Banner for unauthenticated users */}
          {!user && (
            <DemoBanner 
              title="Dashboard"
              description="This is a demo version of the dashboard with sample data."
            />
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.username || 'Demo User'}! 👋
                </h1>
                <p className="text-indigo-100 text-lg">
                  Here's what's happening with your MCP server
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-100">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {user ? 'Connected' : 'Demo Mode'}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Containers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">7</p>
                </div>
                <Server className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">45%</p>
                </div>
                <Cpu className="w-6 h-6 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">62%</p>
                </div>
                <HardDrive className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">API Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1.2K</p>
                </div>
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Sample Dashboard Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {user 
                ? "Welcome to your personalized dashboard with real-time data and full functionality."
                : "This is a demo dashboard showing sample data. Sign in with GitHub to access your real data and full platform features."
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Recent Activity</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <Users className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">User Management</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <Server className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Container Status</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

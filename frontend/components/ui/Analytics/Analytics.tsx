import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// Simplified card components for now
const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => 
  <div className={`bg-white dark:bg-gray-800 rounded-lg border shadow-sm ${className || ''}`} {...props}>{children}</div>;
const CardHeader = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => 
  <div className={`p-6 pb-2 ${className || ''}`} {...props}>{children}</div>;
const CardTitle = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => 
  <h3 className={`text-lg font-semibold ${className || ''}`} {...props}>{children}</h3>;
const CardContent = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => 
  <div className={`p-6 pt-2 ${className || ''}`} {...props}>{children}</div>;

// Simple className utility
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, change, icon, className }: MetricCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={cn(
              "text-sm font-medium",
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            )}>
              {change.type === 'increase' ? '+' : '-'}{change.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

interface PerformanceChartProps {
  data: Array<{
    time: string;
    cpu: number;
    memory: number;
    network: number;
  }>;
  className?: string;
}

export function PerformanceChart({ data, className }: PerformanceChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="cpu" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="CPU %"
            />
            <Line 
              type="monotone" 
              dataKey="memory" 
              stroke="#06b6d4" 
              strokeWidth={2}
              name="Memory %"
            />
            <Line 
              type="monotone" 
              dataKey="network" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Network KB/s"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface UsageDistributionProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  className?: string;
}

export function UsageDistribution({ data, className }: UsageDistributionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Resource Usage Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ActivityChartProps {
  data: Array<{
    date: string;
    requests: number;
    errors: number;
    users: number;
  }>;
  className?: string;
}

export function ActivityChart({ data, className }: ActivityChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Daily Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Area
              type="monotone"
              dataKey="requests"
              stackId="1"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
              name="API Requests"
            />
            <Area
              type="monotone"
              dataKey="users"
              stackId="1"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.6}
              name="Active Users"
            />
            <Area
              type="monotone"
              dataKey="errors"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
              name="Errors"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
/**
 * Centralized Metrics Type Definitions
 * DRY Principle: Consolidates all metrics interfaces scattered across the codebase
 *
 * Previously found in:
 * - src/components/UltimateMCPDashboard.tsx (PerformanceMetrics, QualityMetrics)
 * - src/lib/store.ts (PerformanceMetrics)
 * - src/lib/enhanced-ux-automation.ts (PerformanceMetrics)
 * - src/lib/codeQualityEnhancer.ts (CodeQualityMetrics)
 * - src/lib/performanceOptimizer.ts (ScalingMetrics)
 * - src/lib/mcpEnhancementEngine.ts (EnhancementMetrics)
 */

// Base metrics interface for common properties
export interface BaseMetrics {
  timestamp: number;
  source: string;
  version: string;
}

// Performance metrics - unified definition
export interface PerformanceMetrics extends BaseMetrics {
  responseTime: number;
  uptime: number;
  requestsPerSecond: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  throughput?: number;
  latency?: {
    p50: number;
    p95: number;
    p99: number;
  };
  connections?: {
    active: number;
    idle: number;
    total: number;
  };
}

// Quality metrics - unified definition
export interface QualityMetrics extends BaseMetrics {
  testCoverage: number;
  codeQuality: string;
  securityScore: number;
  accessibilityScore: number;
  performanceScore: number;
  maintainabilityIndex?: number;
  technicalDebt?: number;
  codeSmells?: number;
  vulnerabilities?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

// Code quality specific metrics
export interface CodeQualityMetrics extends BaseMetrics {
  complexity: number;
  duplication: number;
  maintainability: number;
  reliability: number;
  security: number;
  coverage: number;
  linesOfCode: number;
  technicalDebt: number;
  codeSmells: number;
  bugs: number;
  violations: {
    blocker: number;
    critical: number;
    major: number;
    minor: number;
    info: number;
  };
}

// Scaling metrics for performance optimization
export interface ScalingMetrics extends BaseMetrics {
  horizontalScale: {
    instances: number;
    loadBalancer: string;
    autoScalingEnabled: boolean;
  };
  verticalScale: {
    cpu: string;
    memory: string;
    storage: string;
  };
  performance: {
    averageResponseTime: number;
    peakConcurrency: number;
    errorRate: number;
  };
  costs: {
    compute: number;
    storage: number;
    network: number;
    total: number;
  };
}

// Enhancement metrics for MCP engine
export interface EnhancementMetrics extends BaseMetrics {
  enhancementsApplied: number;
  successRate: number;
  averageImprovementScore: number;
  categoriesEnhanced: string[];
  timeToComplete: number;
  userSatisfactionScore?: number;
  businessImpact?: {
    productivityGain: number;
    costReduction: number;
    qualityImprovement: number;
  };
}

// Platform status metrics
export interface PlatformStatus extends BaseMetrics {
  name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error' | 'maintenance';
  lastSeen: string;
  features: string[];
  responseTime: number;
  errorCount: number;
  healthScore: number;
  dependencies?: {
    [key: string]: 'healthy' | 'degraded' | 'down';
  };
}

// Aggregated metrics for dashboard display
export interface MetricsDashboard {
  performance: PerformanceMetrics;
  quality: QualityMetrics;
  platform: PlatformStatus[];
  enhancements: EnhancementMetrics;
  scaling?: ScalingMetrics;
  lastUpdated: number;
  trends: {
    [key: string]: {
      current: number;
      previous: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
}

// Metric collection configuration
export interface MetricsConfig {
  collectionInterval: number; // in milliseconds
  retentionPeriod: number; // in days
  enabledMetrics: string[];
  thresholds: {
    performance: {
      responseTime: number;
      errorRate: number;
      cpuUsage: number;
      memoryUsage: number;
    };
    quality: {
      minTestCoverage: number;
      minSecurityScore: number;
      minPerformanceScore: number;
    };
  };
  alerts: {
    enabled: boolean;
    channels: string[];
    rules: MetricAlertRule[];
  };
}

// Alert rule definition
export interface MetricAlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  duration: number; // in minutes
  enabled: boolean;
}

// Metrics query interface
export interface MetricsQuery {
  metrics: string[];
  timeRange: {
    start: number;
    end: number;
  };
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  filters?: {
    [key: string]: string | number | boolean;
  };
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
}

// Metrics response
export interface MetricsResponse {
  query: MetricsQuery;
  data: {
    [metric: string]: {
      timestamps: number[];
      values: number[];
    };
  };
  metadata: {
    totalPoints: number;
    queryTime: number;
    cached: boolean;
  };
}

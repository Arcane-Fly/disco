/**
 * Pure Memory Utilities
 * 
 * Pure functions for memory calculations and analysis.
 * All functions in this module are side-effect free.
 */

/**
 * Memory usage statistics
 */
export interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

/**
 * Memory statistics with human-readable values
 */
export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  heapUsedMB: number;
  heapTotalMB: number;
  externalMB: number;
  rssMB: number;
  heapUsagePercent: number;
}

/**
 * Convert bytes to megabytes
 * Pure function - no side effects
 */
export function bytesToMB(bytes: number): number {
  return Math.round(bytes / 1024 / 1024);
}

/**
 * Calculate heap usage percentage
 * Pure function - no side effects
 */
export function calculateHeapUsagePercent(heapUsed: number, heapTotal: number): number {
  if (heapTotal === 0) return 0;
  return Math.round((heapUsed / heapTotal) * 100);
}

/**
 * Convert raw memory usage to statistics
 * Pure function - no side effects
 */
export function calculateMemoryStats(usage: MemoryUsage): MemoryStats {
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss,
    heapUsedMB: bytesToMB(usage.heapUsed),
    heapTotalMB: bytesToMB(usage.heapTotal),
    externalMB: bytesToMB(usage.external),
    rssMB: bytesToMB(usage.rss),
    heapUsagePercent: calculateHeapUsagePercent(usage.heapUsed, usage.heapTotal),
  };
}

/**
 * Check if memory usage exceeds threshold
 * Pure function - no side effects
 */
export function isMemoryThresholdExceeded(
  usage: MemoryUsage,
  thresholdPercent: number
): boolean {
  const usagePercent = calculateHeapUsagePercent(usage.heapUsed, usage.heapTotal);
  return usagePercent > thresholdPercent;
}

/**
 * Calculate memory freed between two measurements
 * Pure function - no side effects
 */
export function calculateMemoryFreed(before: MemoryUsage, after: MemoryUsage): number {
  return bytesToMB(before.heapUsed - after.heapUsed);
}

/**
 * Format memory size to human-readable string
 * Pure function - no side effects
 */
export function formatMemorySize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  } else if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  } else {
    return `${Math.round(bytes / 1024 / 1024 / 1024)}GB`;
  }
}

/**
 * Get memory health status
 * Pure function - no side effects
 */
export function getMemoryHealthStatus(
  usage: MemoryUsage
): 'healthy' | 'warning' | 'critical' {
  const usagePercent = calculateHeapUsagePercent(usage.heapUsed, usage.heapTotal);
  
  if (usagePercent < 70) {
    return 'healthy';
  } else if (usagePercent < 85) {
    return 'warning';
  } else {
    return 'critical';
  }
}

/**
 * Calculate recommended heap size based on current usage
 * Pure function - no side effects
 */
export function calculateRecommendedHeapSize(usage: MemoryUsage): number {
  // Recommend 1.5x current heap used, rounded up to nearest 128MB
  const recommended = Math.ceil((usage.heapUsed * 1.5) / (128 * 1024 * 1024)) * 128;
  return recommended;
}

/**
 * Memory thresholds for different severities
 */
export const MEMORY_THRESHOLDS = {
  HEALTHY: 70,
  WARNING: 85,
  CRITICAL: 95,
} as const;

/**
 * Default memory limits
 */
export const MEMORY_LIMITS = {
  MIN_HEAP_MB: 128,
  MAX_HEAP_MB: 4096,
  DEFAULT_HEAP_MB: 1536,
} as const;

/**
 * Memory Monitoring Utility
 * Provides real-time memory usage tracking and garbage collection management
 */

import { logger } from './logger.js';

interface MemoryStats {
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

class MemoryMonitor {
  private monitorInterval: NodeJS.Timeout | null = null;
  private gcEnabled: boolean = false;
  private readonly thresholdPercent: number = 85; // Trigger GC at 85% heap usage
  private readonly checkIntervalMs: number = 30000; // Check every 30 seconds

  constructor() {
    // Check if GC is exposed via --expose-gc flag
    if (global.gc) {
      this.gcEnabled = true;
      logger.info('Memory monitor initialized with manual GC enabled');
    } else {
      logger.warn('Memory monitor initialized without manual GC (run with --expose-gc to enable)');
    }
  }

  /**
   * Start monitoring memory usage
   */
  start(): void {
    if (this.monitorInterval) {
      logger.warn('Memory monitor already running');
      return;
    }

    logger.info(`Starting memory monitor (check interval: ${this.checkIntervalMs}ms, threshold: ${this.thresholdPercent}%)`);
    
    this.monitorInterval = setInterval(() => {
      this.checkMemory();
    }, this.checkIntervalMs);
  }

  /**
   * Stop monitoring memory usage
   */
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      logger.info('Memory monitor stopped');
    }
  }

  /**
   * Get current memory statistics
   */
  getStats(): MemoryStats {
    const usage = process.memoryUsage();
    
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
      externalMB: Math.round(usage.external / 1024 / 1024),
      rssMB: Math.round(usage.rss / 1024 / 1024),
      heapUsagePercent: Math.round((usage.heapUsed / usage.heapTotal) * 100),
    };
  }

  /**
   * Check memory usage and trigger GC if needed
   */
  private checkMemory(): void {
    const stats = this.getStats();

    // Log memory stats in development or if usage is high
    if (process.env.NODE_ENV !== 'production' || stats.heapUsagePercent > this.thresholdPercent) {
      logger.info('Memory stats', {
        heapUsed: `${stats.heapUsedMB}MB`,
        heapTotal: `${stats.heapTotalMB}MB`,
        heapUsage: `${stats.heapUsagePercent}%`,
        rss: `${stats.rssMB}MB`,
      });
    }

    // Trigger manual GC if heap usage exceeds threshold
    if (this.gcEnabled && stats.heapUsagePercent > this.thresholdPercent) {
      logger.warn(`Heap usage at ${stats.heapUsagePercent}%, triggering manual garbage collection`);
      
      try {
        global.gc();
        
        // Log memory after GC
        const afterStats = this.getStats();
        const freed = stats.heapUsedMB - afterStats.heapUsedMB;
        
        logger.info('Manual GC completed', {
          before: `${stats.heapUsedMB}MB`,
          after: `${afterStats.heapUsedMB}MB`,
          freed: `${freed}MB`,
        });
      } catch (error) {
        logger.error('Failed to trigger manual GC', error);
      }
    }
  }

  /**
   * Force manual garbage collection
   */
  forceGC(): boolean {
    if (!this.gcEnabled) {
      logger.warn('Cannot force GC: not enabled (run with --expose-gc)');
      return false;
    }

    try {
      const beforeStats = this.getStats();
      global.gc();
      const afterStats = this.getStats();
      const freed = beforeStats.heapUsedMB - afterStats.heapUsedMB;
      
      logger.info('Forced GC completed', {
        before: `${beforeStats.heapUsedMB}MB`,
        after: `${afterStats.heapUsedMB}MB`,
        freed: `${freed}MB`,
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to force GC', error);
      return false;
    }
  }
}

// Export singleton instance
export const memoryMonitor = new MemoryMonitor();

// Export for testing
export default memoryMonitor;

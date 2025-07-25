import dotenv from 'dotenv';
import { containerManager } from './lib/containerManager.js';

// Load environment variables
dotenv.config();

/**
 * Worker process for background tasks like cleanup, pre-warming, etc.
 */
class Worker {
  private intervalIds: NodeJS.Timeout[] = [];
  private isShuttingDown = false;

  constructor() {
    console.log('🔧 Starting MCP Worker...');
  }

  /**
   * Start background tasks
   */
  start(): void {
    console.log('▶️  Worker started');

    // Container cleanup task (every 10 minutes)
    const cleanupInterval = setInterval(async () => {
      if (!this.isShuttingDown) {
        await this.runCleanupTask();
      }
    }, 10 * 60 * 1000);
    this.intervalIds.push(cleanupInterval);

    // Container pre-warming task (every 15 minutes)
    const preWarmInterval = setInterval(async () => {
      if (!this.isShuttingDown) {
        await this.runPreWarmTask();
      }
    }, 15 * 60 * 1000);
    this.intervalIds.push(preWarmInterval);

    // Health monitoring task (every 5 minutes)
    const healthInterval = setInterval(async () => {
      if (!this.isShuttingDown) {
        await this.runHealthCheck();
      }
    }, 5 * 60 * 1000);
    this.intervalIds.push(healthInterval);

    // Memory monitoring task (every 2 minutes)
    const memoryInterval = setInterval(async () => {
      if (!this.isShuttingDown) {
        await this.runMemoryCheck();
      }
    }, 2 * 60 * 1000);
    this.intervalIds.push(memoryInterval);

    console.log('✅ Background tasks scheduled');
  }

  /**
   * Container cleanup task
   */
  private async runCleanupTask(): Promise<void> {
    try {
      console.log('🧹 Running container cleanup task...');
      
      const stats = containerManager.getStats();
      console.log(`📊 Active containers: ${stats.activeSessions}/${stats.maxContainers}`);
      
      // The cleanup is handled automatically by container manager
      // This task just logs the status
      
      if (stats.activeSessions > stats.maxContainers * 0.8) {
        console.warn('⚠️  High container usage detected');
      }
      
    } catch (error) {
      console.error('❌ Cleanup task failed:', error);
    }
  }

  /**
   * Container pre-warming task
   */
  private async runPreWarmTask(): Promise<void> {
    try {
      console.log('🔥 Running container pre-warm task...');
      
      const stats = containerManager.getStats();
      
      // If pool is getting low, trigger pre-warming
      if (stats.poolReady < 2 && stats.poolInitializing === 0) {
        console.log('🔥 Pool running low, triggering pre-warm...');
        // Container manager handles pre-warming automatically
      }
      
    } catch (error) {
      console.error('❌ Pre-warm task failed:', error);
    }
  }

  /**
   * Health monitoring task
   */
  private async runHealthCheck(): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();
      const stats = containerManager.getStats();
      
      console.log(`💓 Health check - Uptime: ${Math.floor(uptime)}s, Memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB, Containers: ${stats.activeSessions}`);
      
      // Check for potential issues
      if (memoryUsage.heapUsed > memoryUsage.heapTotal * 0.8) {
        console.warn('⚠️  High memory usage detected');
      }
      
      if (stats.activeSessions > stats.maxContainers * 0.9) {
        console.warn('⚠️  Near container limit');
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Memory monitoring and garbage collection
   */
  private async runMemoryCheck(): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage();
      const memUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const memTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      
      console.log(`🧠 Memory usage: ${memUsedMB}MB / ${memTotalMB}MB`);
      
      // Force garbage collection if memory usage is high
      if (memoryUsage.heapUsed > memoryUsage.heapTotal * 0.8) {
        console.log('🗑️  Forcing garbage collection...');
        if (global.gc) {
          global.gc();
          console.log('✅ Garbage collection completed');
        } else {
          console.warn('⚠️  Garbage collection not available (run with --expose-gc)');
        }
      }
      
    } catch (error) {
      console.error('❌ Memory check failed:', error);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Worker shutting down...');
    this.isShuttingDown = true;
    
    // Clear all intervals
    for (const intervalId of this.intervalIds) {
      clearInterval(intervalId);
    }
    
    console.log('✅ Worker shutdown complete');
  }
}

// Create and start worker
const worker = new Worker();
worker.start();

// Handle shutdown signals
const gracefulShutdown = async () => {
  console.log('📡 Received shutdown signal');
  
  await worker.shutdown();
  await containerManager.shutdown();
  
  console.log('✅ Worker process shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

console.log('🚀 MCP Worker is running');

export default worker;
#!/usr/bin/env node

/**
 * Cleanup script for stale containers and memory optimization
 * Designed to run as a cron job every 6 hours
 */

import { containerManager } from '../dist/lib/containerManager.js';

async function cleanupStaleContainers() {
  console.log('🧹 Starting scheduled container cleanup...');
  
  try {
    const stats = containerManager.getStats();
    console.log(`📊 Current state: ${stats.activeSessions} active containers`);
    
    // Force memory cleanup if usage is high
    const memUsage = process.memoryUsage();
    const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    console.log(`💾 Memory usage: ${memPercent.toFixed(1)}%`);
    
    if (memPercent > 60) {
      console.log('⚠️ High memory usage detected, triggering aggressive cleanup');
      
      // Get all sessions and find old ones
      const allSessions = containerManager.getAllSessions();
      const now = Date.now();
      const oldSessions = allSessions.filter(session => {
        const ageMinutes = (now - session.lastActive.getTime()) / (1000 * 60);
        return ageMinutes > 10; // Aggressive: cleanup anything older than 10 minutes
      });
      
      for (const session of oldSessions) {
        try {
          await containerManager.terminateSession(session.id);
          console.log(`🗑️ Cleaned up old session: ${session.id}`);
        } catch (error) {
          console.error(`Failed to cleanup session ${session.id}:`, error);
        }
      }
    }
    
    // Trigger garbage collection
    if (global.gc) {
      global.gc();
      console.log('🗑️ Triggered garbage collection');
    }
    
    const finalStats = containerManager.getStats();
    console.log(`✅ Cleanup complete: ${finalStats.activeSessions} containers remaining`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupStaleContainers()
  .then(() => {
    console.log('✅ Scheduled cleanup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Scheduled cleanup failed:', error);
    process.exit(1);
  });
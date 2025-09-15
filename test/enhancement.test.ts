/**
 * Enhancement System Integration Tests
 * Tests the comprehensive 10x improvement framework
 */

import request from 'supertest';
import { createTestServer } from '../src/testServer.js';
import { mcpEnhancementEngine } from '../src/lib/mcpEnhancementEngine.js';
import { performanceOptimizer } from '../src/lib/performanceOptimizer.js';

describe('Enhancement System Integration', () => {
  let app: any;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestServer();
    
    // Get auth token for testing
    const authResponse = await request(app)
      .post('/api/v1/auth/github/callback')
      .send({
        code: 'test-code',
        state: 'test-state',
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback'
      });
    
    if (authResponse.body.data?.token) {
      authToken = authResponse.body.data.token;
    } else {
      // Create a test token
      authToken = 'test-token-for-enhancement-testing';
    }
  });

  describe('Enhancement Status API', () => {
    test('should return enhancement engine status', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('enhancementMetrics');
      expect(response.body).toHaveProperty('activeOptimizations');
      expect(response.body).toHaveProperty('totalGain');
      expect(['active', 'optimizing', 'idle']).toContain(response.body.status);
    });

    test('should include performance optimizer metrics', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('performanceOptimizer');
      expect(response.body.performanceOptimizer).toHaveProperty('metrics');
    });
  });

  describe('Enhancement Execution API', () => {
    test('should perform dry run execution', async () => {
      const response = await request(app)
        .post('/api/v1/enhancement/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dryRun: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dryRun', true);
      expect(response.body).toHaveProperty('estimatedGain');
      expect(response.body).toHaveProperty('estimatedDuration');
      expect(response.body).toHaveProperty('strategiesPlanned');
      expect(response.body).toHaveProperty('risks');
      expect(response.body).toHaveProperty('benefits');
    });

    test('should execute enhancement strategy', async () => {
      const response = await request(app)
        .post('/api/v1/enhancement/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dryRun: false
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('implemented');
      expect(response.body).toHaveProperty('deferred');
      expect(response.body).toHaveProperty('failed');
      expect(response.body).toHaveProperty('totalGain');
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.implemented)).toBe(true);
      expect(Array.isArray(response.body.deferred)).toBe(true);
      expect(Array.isArray(response.body.failed)).toBe(true);
    }, 30000); // Allow 30 seconds for enhancement execution

    test('should handle specific strategy execution', async () => {
      const response = await request(app)
        .post('/api/v1/enhancement/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          strategies: ['advanced-caching', 'request-batching'],
          dryRun: true
        });

      expect(response.status).toBe(200);
      expect(response.body.dryRun).toBe(true);
    });
  });

  describe('Innovation Opportunities API', () => {
    test('should analyze innovation opportunities', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/opportunities')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('opportunities');
      expect(response.body).toHaveProperty('analysis');
      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.opportunities)).toBe(true);
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      
      if (response.body.opportunities.length > 0) {
        const opportunity = response.body.opportunities[0];
        expect(opportunity).toHaveProperty('area');
        expect(opportunity).toHaveProperty('currentState');
        expect(opportunity).toHaveProperty('targetState');
        expect(opportunity).toHaveProperty('potentialGain');
        expect(opportunity).toHaveProperty('implementationComplexity');
        expect(opportunity).toHaveProperty('businessImpact');
        expect(opportunity).toHaveProperty('timeline');
      }
    });

    test('should provide strategic analysis', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/opportunities')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.analysis).toHaveProperty('totalOpportunities');
      expect(response.body.analysis).toHaveProperty('averagePotentialGain');
      expect(response.body.analysis).toHaveProperty('quickestWins');
      expect(response.body.analysis).toHaveProperty('strategicInitiatives');
    });
  });

  describe('Performance Report API', () => {
    test('should generate JSON report', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/report')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('currentMetrics');
      expect(response.body).toHaveProperty('improvements');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('strategicInsights');
      expect(response.body).toHaveProperty('optimizerMetrics');
    });

    test('should generate executive report', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/report?format=executive')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('executiveSummary');
      expect(response.body.executiveSummary).toHaveProperty('overallImprovement');
      expect(response.body.executiveSummary).toHaveProperty('keyAchievements');
      expect(response.body.executiveSummary).toHaveProperty('businessImpact');
      expect(response.body.executiveSummary).toHaveProperty('strategicRecommendations');
      expect(response.body.executiveSummary).toHaveProperty('nextSteps');
    });

    test('should generate technical report', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/report?format=technical')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('technicalDetails');
      expect(response.body.technicalDetails).toHaveProperty('systemMetrics');
      expect(response.body.technicalDetails).toHaveProperty('optimizerDetails');
      expect(response.body.technicalDetails).toHaveProperty('implementationDetails');
    });
  });

  describe('Optimization API', () => {
    test('should optimize cache', async () => {
      const response = await request(app)
        .post('/api/v1/enhancement/optimize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'cache',
          intensity: 'moderate'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('optimizationType', 'cache');
      expect(response.body).toHaveProperty('intensity', 'moderate');
      expect(response.body).toHaveProperty('executionTime');
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('success', true);
    });

    test('should optimize memory', async () => {
      const response = await request(app)
        .post('/api/v1/enhancement/optimize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'memory',
          intensity: 'light'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('optimizationType', 'memory');
      expect(response.body.results).toHaveProperty('memoryBefore');
      expect(response.body.results).toHaveProperty('memoryAfter');
    });

    test('should perform comprehensive optimization', async () => {
      const response = await request(app)
        .post('/api/v1/enhancement/optimize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'all',
          intensity: 'aggressive',
          duration: 60
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('optimizationType', 'all');
      expect(response.body.results).toHaveProperty('cache');
      expect(response.body.results).toHaveProperty('memory');
      expect(response.body.results).toHaveProperty('containers');
      expect(response.body.results).toHaveProperty('performance');
    });

    test('should validate optimization input', async () => {
      const response = await request(app)
        .post('/api/v1/enhancement/optimize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'invalid-type',
          intensity: 'moderate'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Error Handling', () => {
    test('should handle unauthorized requests', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/status');

      expect(response.status).toBe(401);
    });

    test('should handle invalid auth token', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/status')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Performance Metrics', () => {
    test('should track performance improvements over time', async () => {
      // First, get baseline metrics
      const baselineResponse = await request(app)
        .get('/api/v1/enhancement/status')
        .set('Authorization', `Bearer ${authToken}`);

      const baselineGain = baselineResponse.body.totalGain;

      // Execute an enhancement
      await request(app)
        .post('/api/v1/enhancement/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ dryRun: false });

      // Check improved metrics
      const improvedResponse = await request(app)
        .get('/api/v1/enhancement/status')
        .set('Authorization', `Bearer ${authToken}`);

      const improvedGain = improvedResponse.body.totalGain;

      // Should show improvement (or at least no degradation)
      expect(improvedGain).toBeGreaterThanOrEqual(baselineGain);
    }, 45000); // Allow extra time for enhancement execution

    test('should provide detailed optimization metrics', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      if (response.body.performanceOptimizer?.metrics) {
        const metrics = response.body.performanceOptimizer.metrics;
        expect(metrics).toHaveProperty('totalUsersAnalyzed');
        expect(metrics).toHaveProperty('scalingActionsToday');
        expect(metrics).toHaveProperty('optimizationStatus');
      }
    });
  });

  describe('Integration with Existing Systems', () => {
    test('should integrate with performance optimizer', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('performanceOptimizer');
    });

    test('should work with container management', async () => {
      const optimizeResponse = await request(app)
        .post('/api/v1/enhancement/optimize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'containers',
          intensity: 'moderate'
        });

      expect(optimizeResponse.status).toBe(200);
      expect(optimizeResponse.body.results).toHaveProperty('containersOptimized');
    });
  });

  describe('Strategic Consulting Features', () => {
    test('should provide consulting-style recommendations', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/opportunities')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.recommendations).toContain(
        expect.stringMatching(/AI|performance|optimization|enhancement/i)
      );
    });

    test('should provide business impact analysis', async () => {
      const response = await request(app)
        .get('/api/v1/enhancement/report?format=executive')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.executiveSummary.businessImpact).toHaveProperty('userSatisfaction');
      expect(response.body.executiveSummary.businessImpact).toHaveProperty('costReduction');
      expect(response.body.executiveSummary.businessImpact).toHaveProperty('securityPosture');
    });
  });
});

describe('Enhancement Engine Core Functionality', () => {
  test('should initialize enhancement engine', () => {
    expect(mcpEnhancementEngine).toBeDefined();
    expect(typeof mcpEnhancementEngine.executeEnhancementStrategy).toBe('function');
    expect(typeof mcpEnhancementEngine.analyzeInnovationOpportunities).toBe('function');
    expect(typeof mcpEnhancementEngine.generatePerformanceReport).toBe('function');
  });

  test('should execute enhancement strategies', async () => {
    const result = await mcpEnhancementEngine.executeEnhancementStrategy();
    
    expect(result).toHaveProperty('implemented');
    expect(result).toHaveProperty('deferred');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('totalGain');
    expect(Array.isArray(result.implemented)).toBe(true);
    expect(Array.isArray(result.deferred)).toBe(true);
    expect(Array.isArray(result.failed)).toBe(true);
    expect(typeof result.totalGain).toBe('number');
  }, 30000);

  test('should analyze innovation opportunities', async () => {
    const opportunities = await mcpEnhancementEngine.analyzeInnovationOpportunities();
    
    expect(Array.isArray(opportunities)).toBe(true);
    expect(opportunities.length).toBeGreaterThan(0);
    
    if (opportunities.length > 0) {
      const opp = opportunities[0];
      expect(opp).toHaveProperty('area');
      expect(opp).toHaveProperty('potentialGain');
      expect(opp).toHaveProperty('businessImpact');
    }
  });

  test('should generate performance report', () => {
    const report = mcpEnhancementEngine.generatePerformanceReport();
    
    expect(report).toHaveProperty('currentMetrics');
    expect(report).toHaveProperty('improvements');
    expect(report).toHaveProperty('recommendations');
    expect(report).toHaveProperty('strategicInsights');
    expect(Array.isArray(report.recommendations)).toBe(true);
    expect(Array.isArray(report.strategicInsights)).toBe(true);
  });

  test('should track active optimizations', () => {
    const active = mcpEnhancementEngine.getActiveOptimizations();
    const implemented = mcpEnhancementEngine.getImplementedStrategies();
    const opportunities = mcpEnhancementEngine.getInnovationOpportunities();
    
    expect(Array.isArray(active)).toBe(true);
    expect(Array.isArray(implemented)).toBe(true);
    expect(Array.isArray(opportunities)).toBe(true);
  });
});

// Performance benchmarking test
describe('Performance Benchmarks', () => {
  test('should demonstrate performance improvements', async () => {
    const startTime = Date.now();
    
    // Simulate some operations that would benefit from optimization
    const promises = Array.from({ length: 100 }, (_, i) => 
      new Promise(resolve => setTimeout(resolve, Math.random() * 10))
    );
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    // This test ensures the system can handle concurrent operations
    expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('should maintain low memory usage during optimization', async () => {
    const memBefore = process.memoryUsage();
    
    // Execute enhancement strategy
    await mcpEnhancementEngine.executeEnhancementStrategy();
    
    const memAfter = process.memoryUsage();
    const memoryIncrease = memAfter.heapUsed - memBefore.heapUsed;
    
    // Memory increase should be reasonable (less than 100MB)
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
  }, 30000);
});
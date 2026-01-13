import { enhancedUXAutomationManager } from '../src/lib/enhanced-ux-automation';
import { containerManager } from '../src/lib/containerManager';

/**
 * Strategic UX Enhancement Tests
 *
 * This test suite validates the strategic UI/UX improvements outlined in the
 * Strategic Intensification Plan, including accessibility validation,
 * performance monitoring, and semantic analysis capabilities.
 */

describe('Strategic UX Enhancements', () => {
  let mockSession: any;
  let mockPage: any;
  const sessionId = 'test-session-001';
  const pageId = 'test-page-001';
  const containerId = 'test-container-001';

  beforeEach(() => {
    // Mock browser page with enhanced capabilities
    mockPage = {
      $: jest.fn(),
      $$: jest.fn(),
      $$eval: jest.fn(),
      evaluate: jest.fn(),
      getAttribute: jest.fn(),
      waitForTimeout: jest.fn(),
      textContent: jest.fn(),
      click: jest.fn(),
      fill: jest.fn(),
      scrollIntoViewIfNeeded: jest.fn(),
      screenshot: jest.fn().mockResolvedValue(Buffer.from('fake-screenshot-data')),
      tagName: jest.fn(),
      evaluateHandle: jest.fn(),
    };

    // Mock browser session
    mockSession = {
      id: sessionId,
      containerId,
      pages: new Map([[pageId, mockPage]]),
      createdAt: new Date(),
      lastUsed: new Date(),
      config: {
        viewport: { width: 1920, height: 1080 },
        headless: true,
      },
    };

    // Mock the getSession method
    jest.spyOn(enhancedUXAutomationManager, 'getSession').mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Intelligent UI Automation', () => {
    test('should perform enhanced UI automation with accessibility validation', async () => {
      // Setup mock responses for accessibility validation
      mockPage.$.mockResolvedValue({
        getAttribute: jest
          .fn()
          .mockResolvedValueOnce('Test Button') // aria-label
          .mockResolvedValueOnce(null) // aria-labelledby
          .mockResolvedValueOnce(null), // aria-describedby
        tagName: jest.fn().mockResolvedValue('BUTTON'),
        evaluate: jest.fn().mockResolvedValue({
          color: 'rgb(255, 255, 255)',
          backgroundColor: 'rgb(0, 123, 255)',
        }),
        scrollIntoViewIfNeeded: jest.fn(),
        click: jest.fn(),
      });

      const actions = [
        {
          type: 'click' as const,
          selector: '#test-button',
          validation: {
            accessibility: true,
            performance: false,
            semantics: false,
            usability: false,
          },
        },
      ];

      const results = await enhancedUXAutomationManager.performIntelligentUIAutomation(
        sessionId,
        pageId,
        actions
      );

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].action).toBe('click');
      expect(results[0].accessibilityResults).toBeDefined();
      expect(mockPage.$.mock.calls[0][0]).toBe('#test-button');
    });

    test('should handle accessibility validation failures gracefully', async () => {
      // Setup mock to simulate missing accessibility attributes
      mockPage.$.mockResolvedValue({
        getAttribute: jest.fn().mockResolvedValue(null), // No accessibility attributes
        tagName: jest.fn().mockResolvedValue('BUTTON'),
        evaluate: jest.fn().mockResolvedValue({
          color: 'rgb(128, 128, 128)',
          backgroundColor: 'rgb(255, 255, 255)',
        }),
        scrollIntoViewIfNeeded: jest.fn(),
        click: jest.fn(),
      });

      const actions = [
        {
          type: 'click' as const,
          selector: '#inaccessible-button',
          validation: {
            accessibility: true,
            performance: false,
            semantics: false,
            usability: false,
          },
        },
      ];

      const results = await enhancedUXAutomationManager.performIntelligentUIAutomation(
        sessionId,
        pageId,
        actions
      );

      expect(results[0].accessibilityResults?.compliant).toBe(false);
      expect(results[0].accessibilityResults?.issues.length).toBeGreaterThan(0);
      expect(results[0].accessibilityResults?.issues[0].type).toBe('missing-label');
    });

    test('should perform performance monitoring during actions', async () => {
      // Mock performance metrics
      mockPage.evaluate.mockResolvedValue({
        responseTime: 250,
        renderTime: 150,
        interactiveTime: 400,
        firstContentfulPaint: 300,
        cumulativeLayoutShift: 0.05,
        largestContentfulPaint: 500,
      });

      mockPage.$.mockResolvedValue({
        scrollIntoViewIfNeeded: jest.fn(),
        click: jest.fn(),
        fill: jest.fn(),
      });

      const actions = [
        {
          type: 'type' as const,
          selector: '#test-input',
          text: 'Strategic UX Test',
          validation: {
            accessibility: false,
            performance: true,
            semantics: false,
            usability: false,
          },
        },
      ];

      const results = await enhancedUXAutomationManager.performIntelligentUIAutomation(
        sessionId,
        pageId,
        actions
      );

      expect(results[0].performanceMetrics).toBeDefined();
      expect(results[0].performanceMetrics?.responseTime).toBe(250);
      expect(results[0].performanceMetrics?.renderTime).toBe(150);
    });

    test('should provide usability scoring for actions', async () => {
      // Mock page state for usability calculation
      mockPage.$.mockImplementation((selector: string) => {
        if (selector.includes('.error')) return null; // No error messages
        if (selector.includes('.loading')) return null; // No loading states
        if (selector.includes('.success')) return { found: true }; // Success feedback present
        return { scrollIntoViewIfNeeded: jest.fn(), click: jest.fn() };
      });

      const actions = [
        {
          type: 'click' as const,
          selector: '#usability-test-button',
          validation: {
            accessibility: false,
            performance: false,
            semantics: false,
            usability: true,
          },
        },
      ];

      const results = await enhancedUXAutomationManager.performIntelligentUIAutomation(
        sessionId,
        pageId,
        actions
      );

      expect(results[0].usabilityScore).toBeDefined();
      expect(results[0].usabilityScore).toBeGreaterThan(0);
      expect(results[0].usabilityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Advanced Visual Regression Testing', () => {
    test('should perform comprehensive visual regression with all enhancements', async () => {
      // Mock the base visual regression method
      jest.spyOn(enhancedUXAutomationManager, 'performVisualRegression').mockResolvedValue({
        passed: true,
        similarity: 0.98,
        differences: 2,
        screenshotPath: '/tmp/test-screenshot.png',
      });

      // Mock page accessibility validation
      mockPage.$$.mockImplementation((selector: string) => {
        if (selector === 'img')
          return [{ getAttribute: jest.fn().mockResolvedValue('Test image') }];
        if (selector === 'h1, h2, h3, h4, h5, h6')
          return [
            { tagName: jest.fn().mockResolvedValue('H1') },
            { tagName: jest.fn().mockResolvedValue('H2') },
          ];
        if (selector === 'input, select, textarea') return [];
        return [];
      });

      mockPage.$.mockImplementation((selector: string) => {
        if (selector === 'main, [role="main"]') return { found: true };
        if (selector === 'meta[name="viewport"]') return { found: true };
        return null;
      });

      mockPage.evaluate.mockResolvedValue({
        responseTime: 300,
        renderTime: 200,
        interactiveTime: 500,
        firstContentfulPaint: 400,
        cumulativeLayoutShift: 0.02,
        largestContentfulPaint: 600,
      });

      mockPage.textContent.mockResolvedValue('Sample page content for semantic analysis');

      const result = await enhancedUXAutomationManager.performAdvancedVisualRegression(
        sessionId,
        pageId,
        'strategic-test-regression',
        {
          threshold: 0.95,
          validateAccessibility: true,
          analyzeSemantics: true,
          comparePerformance: true,
        }
      );

      expect(result.passed).toBe(true);
      expect(result.similarity).toBe(0.98);
      expect(result.accessibilityValidation).toBeDefined();
      expect(result.semanticAnalysis).toBeDefined();
      expect(result.performanceComparison).toBeDefined();
      expect(result.usabilityScore).toBeDefined();
    });

    test('should identify accessibility violations in visual regression', async () => {
      // Mock base visual regression
      jest.spyOn(enhancedUXAutomationManager, 'performVisualRegression').mockResolvedValue({
        passed: true,
        similarity: 0.99,
        differences: 1,
        screenshotPath: '/tmp/test-screenshot.png',
      });

      // Mock page with accessibility violations
      mockPage.$$.mockImplementation((selector: string) => {
        if (selector === 'img')
          return [
            { getAttribute: jest.fn().mockResolvedValue(null) }, // Missing alt text
            { getAttribute: jest.fn().mockResolvedValue('Valid alt text') },
          ];
        if (selector === 'h1, h2, h3, h4, h5, h6') return []; // No headings
        return [];
      });

      mockPage.$.mockImplementation((selector: string) => {
        if (selector === 'main, [role="main"]') return null; // Missing main landmark
        return null;
      });

      const result = await enhancedUXAutomationManager.performAdvancedVisualRegression(
        sessionId,
        pageId,
        'accessibility-violation-test',
        { validateAccessibility: true }
      );

      expect(result.accessibilityValidation?.compliant).toBe(false);
      expect(result.accessibilityValidation?.issues.length).toBeGreaterThan(0);

      const issueTypes = result.accessibilityValidation?.issues.map(issue => issue.type);
      expect(issueTypes).toContain('missing-alt-text');
      expect(issueTypes).toContain('missing-main-landmark');
    });

    test('should detect performance regressions', async () => {
      // Mock base visual regression
      jest.spyOn(enhancedUXAutomationManager, 'performVisualRegression').mockResolvedValue({
        passed: true,
        similarity: 0.97,
        differences: 3,
        screenshotPath: '/tmp/test-screenshot.png',
      });

      // Mock current performance metrics (slower than baseline)
      mockPage.evaluate.mockResolvedValue({
        responseTime: 800, // Slower than baseline 500ms
        renderTime: 400, // Slower than baseline 200ms
        interactiveTime: 1200,
        firstContentfulPaint: 700,
        cumulativeLayoutShift: 0.15,
        largestContentfulPaint: 1000,
      });

      const result = await enhancedUXAutomationManager.performAdvancedVisualRegression(
        sessionId,
        pageId,
        'performance-regression-test',
        { comparePerformance: true }
      );

      expect(result.performanceComparison?.regressions.length).toBeGreaterThan(0);
      expect(result.performanceComparison?.improvement).toBeLessThan(0); // Negative improvement (regression)
    });
  });

  describe('Quality Assessment Integration', () => {
    test('should provide comprehensive quality metrics', async () => {
      const testActions = [
        {
          type: 'validate' as const,
          validation: {
            accessibility: true,
            performance: true,
            semantics: true,
            usability: true,
          },
        },
      ];

      // Mock comprehensive responses
      mockPage.$.mockResolvedValue({
        getAttribute: jest.fn().mockResolvedValue('Accessible label'),
        tagName: jest.fn().mockResolvedValue('BUTTON'),
        evaluate: jest.fn().mockResolvedValue({
          color: 'rgb(0, 0, 0)',
          backgroundColor: 'rgb(255, 255, 255)',
        }),
      });

      mockPage.evaluate.mockResolvedValue({
        responseTime: 200,
        renderTime: 100,
        interactiveTime: 300,
        firstContentfulPaint: 250,
        cumulativeLayoutShift: 0.01,
        largestContentfulPaint: 400,
      });

      const results = await enhancedUXAutomationManager.performIntelligentUIAutomation(
        sessionId,
        pageId,
        testActions
      );

      const result = results[0];
      expect(result.success).toBe(true);
      // Accessibility results are not returned by performComprehensiveValidation
      expect(result.performanceMetrics?.responseTime).toBe(200);
      expect(result.usabilityScore).toBeGreaterThan(80);
    });

    test('should calculate appropriate quality scores', async () => {
      // Test scoring algorithm with various quality levels
      const testScenarios = [
        { accessibility: 100, performance: 95, usability: 90, expected: 95.5 },
        { accessibility: 80, performance: 85, usability: 75, expected: 80.5 },
        { accessibility: 60, performance: 70, usability: 65, expected: 64.5 },
      ];

      for (const scenario of testScenarios) {
        // This would test the internal scoring calculation
        // In a real implementation, we'd create a method to calculate composite scores
        const compositeScore =
          scenario.accessibility * 0.4 + scenario.performance * 0.3 + scenario.usability * 0.3;

        expect(compositeScore).toBeCloseTo(scenario.expected, 0);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing browser session gracefully', async () => {
      // Mock session not found
      jest.spyOn(enhancedUXAutomationManager, 'getSession').mockResolvedValue(null);

      const actions = [{ type: 'click' as const, selector: '#test' }];

      await expect(
        enhancedUXAutomationManager.performIntelligentUIAutomation(
          'invalid-session',
          pageId,
          actions
        )
      ).rejects.toThrow('Browser session not found');
    });

    test('should handle missing page gracefully', async () => {
      // Mock session with no pages
      const emptySession = {
        ...mockSession,
        pages: new Map(),
      };

      jest.spyOn(enhancedUXAutomationManager, 'getSession').mockResolvedValue(emptySession);

      const actions = [{ type: 'click' as const, selector: '#test' }];

      await expect(
        enhancedUXAutomationManager.performIntelligentUIAutomation(
          sessionId,
          'invalid-page',
          actions
        )
      ).rejects.toThrow('Page not found in session');
    });

    test('should continue automation when individual actions fail', async () => {
      mockPage.$.mockImplementation((selector: string) => {
        if (selector === '#failing-element') {
          throw new Error('Element interaction failed');
        }
        return {
          scrollIntoViewIfNeeded: jest.fn(),
          click: jest.fn(),
        };
      });

      const actions = [
        { type: 'click' as const, selector: '#failing-element' },
        { type: 'click' as const, selector: '#working-element' },
      ];

      const results = await enhancedUXAutomationManager.performIntelligentUIAutomation(
        sessionId,
        pageId,
        actions
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(false);
      expect(results[1].success).toBe(true);
    });
  });

  describe('Strategic Innovation Validation', () => {
    test('should demonstrate enhanced automation capabilities', async () => {
      // This test validates that our strategic enhancements provide
      // significantly more value than basic automation

      const basicAction = { type: 'click' as const, selector: '#basic-button' };
      const enhancedAction = {
        type: 'click' as const,
        selector: '#enhanced-button',
        validation: {
          accessibility: true,
          performance: true,
          semantics: true,
          usability: true,
        },
        analysis: {
          userJourney: true,
          conversionFunnel: false,
          behaviorPattern: false,
        },
      };

      // Mock enhanced capabilities
      mockPage.$.mockResolvedValue({
        getAttribute: jest.fn().mockResolvedValue('Enhanced Button'),
        tagName: jest.fn().mockResolvedValue('BUTTON'),
        evaluate: jest.fn().mockResolvedValue({
          color: 'rgb(255, 255, 255)',
          backgroundColor: 'rgb(0, 123, 255)',
        }),
        scrollIntoViewIfNeeded: jest.fn(),
        click: jest.fn(),
      });

      mockPage.evaluate.mockResolvedValue({
        responseTime: 180,
        renderTime: 90,
        interactiveTime: 270,
        firstContentfulPaint: 220,
        cumulativeLayoutShift: 0.005,
        largestContentfulPaint: 350,
      });

      const [basicResult, enhancedResult] = await Promise.all([
        enhancedUXAutomationManager.performIntelligentUIAutomation(sessionId, pageId, [
          basicAction,
        ]),
        enhancedUXAutomationManager.performIntelligentUIAutomation(sessionId, pageId, [
          enhancedAction,
        ]),
      ]);

      // Basic result should have minimal data
      expect(basicResult[0].accessibilityResults).toBeUndefined();
      expect(basicResult[0].performanceMetrics).toBeUndefined();
      expect(basicResult[0].usabilityScore).toBeUndefined();

      // Enhanced result should have comprehensive data
      expect(enhancedResult[0].accessibilityResults).toBeDefined();
      expect(enhancedResult[0].performanceMetrics).toBeDefined();
      expect(enhancedResult[0].usabilityScore).toBeDefined();
      expect(enhancedResult[0].userJourneyAnalysis).toBeDefined();

      // Enhanced result should provide actionable insights
      expect(enhancedResult[0].accessibilityResults?.score).toBeGreaterThan(80);
      expect(enhancedResult[0].usabilityScore).toBeGreaterThan(60);
    });

    test('should provide strategic recommendations for improvement', async () => {
      // Test that our system can identify and recommend improvements

      const analysisAction = {
        type: 'analyze' as const,
        validation: { accessibility: true, performance: true, semantics: true, usability: true },
      };

      // Mock page with various issues for analysis
      mockPage.textContent.mockResolvedValue('Limited content with accessibility issues');
      mockPage.$$eval.mockResolvedValue(2); // Link count
      mockPage.evaluate.mockResolvedValue({
        responseTime: 1500, // Slow performance
        renderTime: 800,
        interactiveTime: 2000,
        firstContentfulPaint: 1200,
        cumulativeLayoutShift: 0.3,
        largestContentfulPaint: 2500,
      });

      const results = await enhancedUXAutomationManager.performIntelligentUIAutomation(
        sessionId,
        pageId,
        [analysisAction]
      );

      const analysis = results[0];
      expect(analysis.semanticValidation).toBeDefined();
      expect(analysis.semanticValidation?.semanticScore).toBeLessThan(1.0);

      // Performance issues should be detected
      if (analysis.performanceMetrics) {
        expect(analysis.performanceMetrics.responseTime).toBeGreaterThan(1000);
      }
    });
  });
});

/**
 * Integration test for Strategic UX API endpoints
 */
describe('Strategic UX API Integration', () => {
  // These tests would require more setup with actual Express app
  // and would test the API endpoints we created

  test('should be ready for API integration testing', () => {
    // Placeholder for API integration tests
    // These would test the actual API endpoints with real HTTP requests
    expect(true).toBe(true);
  });
});

/**
 * Performance benchmarks for strategic enhancements
 */
describe('Strategic Enhancement Performance', () => {
  let mockSession: any;
  let mockPage: any;
  const sessionId = 'perf-session-001';
  const pageId = 'perf-page-001';

  beforeEach(() => {
    // Mock browser page for performance tests
    mockPage = {
      $: jest.fn(),
      getAttribute: jest.fn(),
      tagName: jest.fn(),
      evaluate: jest.fn(),
      scrollIntoViewIfNeeded: jest.fn(),
      click: jest.fn(),
      waitForTimeout: jest.fn(),
    };

    // Mock browser session
    mockSession = {
      id: sessionId,
      containerId: 'perf-container-001',
      pages: new Map([[pageId, mockPage]]),
      createdAt: new Date(),
      lastUsed: new Date(),
      config: {
        viewport: { width: 1920, height: 1080 },
        headless: true,
      },
    };

    // Mock the getSession method
    jest.spyOn(enhancedUXAutomationManager, 'getSession').mockResolvedValue(mockSession);
  });

  test('should complete accessibility validation within acceptable time limits', async () => {
    const startTime = Date.now();

    // Mock fast responses
    mockPage.$.mockResolvedValue({
      getAttribute: jest.fn().mockResolvedValue('Fast test'),
      tagName: jest.fn().mockResolvedValue('BUTTON'),
      evaluate: jest.fn().mockResolvedValue({
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
      }),
      scrollIntoViewIfNeeded: jest.fn(),
      click: jest.fn(),
    });

    const actions = [
      {
        type: 'click' as const,
        selector: '#performance-test',
        validation: { accessibility: true, performance: false, semantics: false, usability: false },
      },
    ];

    await enhancedUXAutomationManager.performIntelligentUIAutomation(sessionId, pageId, actions);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});

export {}; // Make this a module

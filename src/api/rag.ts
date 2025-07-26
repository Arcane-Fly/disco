import { Router, Request, Response } from 'express';
import { containerManager } from '../lib/containerManager.js';
import { ErrorCode } from '../types/index.js';
import { enhancedRAG, EnhancedRAGSearchResult, RAGSearchOptions } from '../lib/enhanced-rag.js';

const router = Router();

/**
 * POST /api/v1/rag/:containerId/search
 * Enhanced search for relevant code snippets using natural language with AST analysis
 */
router.post('/:containerId/search', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { 
      query, 
      limit = 10, 
      includeContext = true, 
      useAST = true, 
      semanticSearch = true,
      includeCodeSuggestions = true 
    } = req.body;
    const userId = req.user!.userId;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Search query is required'
        }
      });
    }

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    console.log(`🧠 Enhanced RAG search query: "${query}" in container ${containerId}`);

    const searchOptions: RAGSearchOptions = {
      query,
      limit,
      includeContext,
      useAST,
      semanticSearch,
      includeCodeSuggestions
    };

    const results = await enhancedRAG.performEnhancedSearch(session.container, searchOptions);

    res.json({
      status: 'success',
      data: {
        query: query,
        results: results,
        totalResults: results.length,
        searchTime: Date.now(),
        containerId: containerId,
        features: {
          astAnalysis: useAST,
          semanticSearch: semanticSearch,
          codeSuggestions: includeCodeSuggestions
        }
      }
    });

  } catch (error) {
    console.error('Enhanced RAG search error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to perform enhanced search'
      }
    });
  }
});

/**
 * POST /api/v1/rag/:containerId/index
 * Index the codebase for search with enhanced AST analysis
 */
router.post('/:containerId/index', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { paths = ['.'], excludePatterns = ['node_modules', '.git', 'dist'] } = req.body;
    const userId = req.user!.userId;

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    console.log(`🧠 Enhanced indexing codebase in container ${containerId}`);

    const indexStats = await enhancedRAG.indexCodebaseWithAST(session.container, {
      paths,
      excludePatterns
    });

    res.json({
      status: 'success',
      data: {
        ...indexStats,
        containerId: containerId,
        indexedAt: new Date().toISOString(),
        features: {
          astAnalysis: true,
          semanticSearch: true,
          codeSuggestions: true
        }
      }
    });

  } catch (error) {
    console.error('Enhanced codebase indexing error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to index codebase with enhanced features'
      }
    });
  }
});

/**
 * POST /api/v1/rag/:containerId/analyze
 * AI-powered code analysis and suggestions
 */
router.post('/:containerId/analyze', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { 
      filePath, 
      analysisType = 'comprehensive', 
      includeRefactoring = true,
      includeOptimization = true,
      includeDocumentation = true
    } = req.body;
    const userId = req.user!.userId;

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'File path is required for analysis'
        }
      });
    }

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    console.log(`🔬 AI-powered code analysis for: ${filePath} in container ${containerId}`);

    const analysis = await performAICodeAnalysis(session.container, {
      filePath,
      analysisType,
      includeRefactoring,
      includeOptimization,
      includeDocumentation
    });

    res.json({
      status: 'success',
      data: {
        filePath: filePath,
        analysis: analysis,
        containerId: containerId,
        analyzedAt: new Date().toISOString(),
        features: {
          refactoringSuggestions: includeRefactoring,
          optimizationHints: includeOptimization,
          documentationSuggestions: includeDocumentation
        }
      }
    });

  } catch (error) {
    console.error('AI code analysis error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to perform AI code analysis'
      }
    });
  }
});

// Helper functions for enhanced RAG operations

// AI Code Analysis function
interface CodeAnalysisOptions {
  filePath: string;
  analysisType: string;
  includeRefactoring: boolean;
  includeOptimization: boolean;
  includeDocumentation: boolean;
}

interface CodeAnalysisResult {
  complexity: {
    score: number;
    rating: string;
    issues: string[];
  };
  refactoring?: {
    suggestions: string[];
    priority: 'low' | 'medium' | 'high';
  };
  optimization?: {
    hints: string[];
    performanceImpact: 'low' | 'medium' | 'high';
  };
  documentation?: {
    missing: string[];
    suggestions: string[];
  };
  codeSmells: string[];
  securityIssues: string[];
}

async function performAICodeAnalysis(container: any, options: CodeAnalysisOptions): Promise<CodeAnalysisResult> {
  try {
    const { filePath, analysisType, includeRefactoring, includeOptimization, includeDocumentation } = options;
    
    console.log(`Performing AI code analysis on: ${filePath}`);
    
    // Read the file content
    const content = await container.fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Basic analysis
    const analysis: CodeAnalysisResult = {
      complexity: analyzeComplexity(content),
      codeSmells: detectCodeSmells(content),
      securityIssues: detectSecurityIssues(content)
    };
    
    // Optional advanced features
    if (includeRefactoring) {
      analysis.refactoring = generateRefactoringSuggestions(content, filePath);
    }
    
    if (includeOptimization) {
      analysis.optimization = generateOptimizationHints(content, filePath);
    }
    
    if (includeDocumentation) {
      analysis.documentation = generateDocumentationSuggestions(content, filePath);
    }
    
    return analysis;
    
  } catch (error) {
    console.error('AI code analysis error:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function analyzeComplexity(content: string): { score: number; rating: string; issues: string[] } {
  let complexity = 0;
  const issues: string[] = [];
  const lines = content.split('\n');
  
  // Count complexity indicators
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Control structures
    if (/\b(if|while|for|switch|catch)\b/.test(trimmed)) {
      complexity += 1;
    }
    
    // Nested functions
    if (/function\s*\(|=>\s*{/.test(trimmed)) {
      complexity += 1;
    }
    
    // Long lines (potential complexity)
    if (line.length > 120) {
      complexity += 0.5;
      issues.push(`Line ${lines.indexOf(line) + 1}: Very long line (${line.length} chars)`);
    }
  }
  
  // Calculate rating
  let rating = 'low';
  if (complexity > 10) rating = 'medium';
  if (complexity > 20) rating = 'high';
  if (complexity > 30) rating = 'very high';
  
  return { score: Math.round(complexity), rating, issues };
}

function detectCodeSmells(content: string): string[] {
  const smells: string[] = [];
  const lines = content.split('\n');
  
  // Detect common code smells
  let functionCount = 0;
  let longMethods = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Long methods
    if (/function\s+\w+|const\s+\w+\s*=.*=>/.test(line)) {
      functionCount++;
      let methodLength = 0;
      for (let j = i; j < lines.length && j < i + 50; j++) {
        methodLength++;
        if (lines[j].includes('}')) break;
      }
      if (methodLength > 30) {
        longMethods++;
        smells.push(`Long method detected starting at line ${i + 1} (${methodLength} lines)`);
      }
    }
    
    // Magic numbers
    if (/\b\d{3,}\b/.test(line) && !line.includes('//') && !line.includes('const')) {
      smells.push(`Magic number on line ${i + 1}: Consider using named constants`);
    }
    
    // Duplicate code patterns
    if (line.trim().length > 20) {
      const duplicates = lines.filter(l => l.trim() === line.trim()).length;
      if (duplicates > 2) {
        smells.push(`Duplicate code pattern: "${line.trim()}" appears ${duplicates} times`);
      }
    }
  }
  
  // Too many functions in one file
  if (functionCount > 15) {
    smells.push(`Large class/file: ${functionCount} functions detected (consider splitting)`);
  }
  
  return [...new Set(smells)]; // Remove duplicates
}

function detectSecurityIssues(content: string): string[] {
  const issues: string[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // SQL Injection risks
    if (line.includes('select ') && line.includes('+')) {
      issues.push(`Line ${i + 1}: Potential SQL injection risk - avoid string concatenation in queries`);
    }
    
    // XSS risks
    if (line.includes('innerhtml') && !line.includes('sanitize')) {
      issues.push(`Line ${i + 1}: Potential XSS risk - sanitize content before setting innerHTML`);
    }
    
    // Eval usage
    if (line.includes('eval(')) {
      issues.push(`Line ${i + 1}: Security risk - avoid using eval()`);
    }
    
    // Hardcoded secrets
    if (/password\s*=\s*['"]/.test(line) || /apikey\s*=\s*['"]/.test(line)) {
      issues.push(`Line ${i + 1}: Potential hardcoded secret - use environment variables`);
    }
    
    // Unsafe file operations
    if (line.includes('fs.readfile') && line.includes('..')) {
      issues.push(`Line ${i + 1}: Path traversal risk - validate file paths`);
    }
  }
  
  return issues;
}

function generateRefactoringSuggestions(content: string, filePath: string): { suggestions: string[]; priority: 'low' | 'medium' | 'high' } {
  const suggestions: string[] = [];
  const lines = content.split('\n');
  let priority: 'low' | 'medium' | 'high' = 'low';
  
  // Analyze for refactoring opportunities
  let nestedDepth = 0;
  let maxNesting = 0;
  
  for (const line of lines) {
    // Track nesting depth
    nestedDepth += (line.match(/{/g) || []).length;
    nestedDepth -= (line.match(/}/g) || []).length;
    maxNesting = Math.max(maxNesting, nestedDepth);
    
    // Arrow function simplification
    if (line.includes('=> {') && line.includes('return ') && !line.includes(';')) {
      suggestions.push('Consider using arrow function shorthand for simple returns');
    }
    
    // Object destructuring opportunities
    if (line.includes('.') && line.includes('const ')) {
      suggestions.push('Consider using object destructuring for cleaner property access');
    }
  }
  
  if (maxNesting > 4) {
    suggestions.push('Consider extracting nested logic into separate functions');
    priority = 'high';
  }
  
  // File extension specific suggestions
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    if (!content.includes('interface') && content.includes('function')) {
      suggestions.push('Consider adding TypeScript interfaces for better type safety');
    }
  }
  
  if (suggestions.length > 5) {
    priority = 'medium';
  }
  
  return { suggestions, priority };
}

function generateOptimizationHints(content: string, filePath: string): { hints: string[]; performanceImpact: 'low' | 'medium' | 'high' } {
  const hints: string[] = [];
  let performanceImpact: 'low' | 'medium' | 'high' = 'low';
  
  // Performance analysis
  if (content.includes('for (') && content.includes('for (')) {
    hints.push('Consider using forEach, map, or filter for better readability and performance');
  }
  
  if (content.includes('querySelector') && content.includes('querySelectorAll')) {
    hints.push('Cache DOM queries to avoid repeated lookups');
    performanceImpact = 'medium';
  }
  
  if (content.includes('JSON.parse') && content.includes('JSON.stringify')) {
    hints.push('Consider caching parsed JSON objects if used repeatedly');
  }
  
  // React-specific optimizations
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    if (content.includes('useState') && !content.includes('useCallback')) {
      hints.push('Consider using useCallback for event handlers in React components');
    }
    
    if (content.includes('map(') && !content.includes('key=')) {
      hints.push('Always provide keys when rendering lists in React');
      performanceImpact = 'high';
    }
  }
  
  // Bundle size considerations
  if (content.includes('import * as ')) {
    hints.push('Use named imports instead of wildcard imports to improve tree shaking');
  }
  
  return { hints, performanceImpact };
}

function generateDocumentationSuggestions(content: string, filePath: string): { missing: string[]; suggestions: string[] } {
  const missing: string[] = [];
  const suggestions: string[] = [];
  const lines = content.split('\n');
  
  // Check for missing documentation
  let functionCount = 0;
  let documentedFunctions = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Function declarations
    if (/function\s+\w+|const\s+\w+\s*=.*=>/.test(line)) {
      functionCount++;
      
      // Check if previous lines contain documentation
      const prevLines = lines.slice(Math.max(0, i - 5), i);
      const hasDocumentation = prevLines.some(l => l.includes('/**') || l.includes('//'));
      
      if (!hasDocumentation) {
        const functionName = line.match(/function\s+(\w+)|const\s+(\w+)\s*=/)?.[1] || 'function';
        missing.push(`Function '${functionName}' at line ${i + 1} lacks documentation`);
      } else {
        documentedFunctions++;
      }
    }
    
    // Class declarations
    if (/class\s+\w+/.test(line)) {
      const prevLines = lines.slice(Math.max(0, i - 3), i);
      const hasDocumentation = prevLines.some(l => l.includes('/**'));
      
      if (!hasDocumentation) {
        const className = line.match(/class\s+(\w+)/)?.[1] || 'class';
        missing.push(`Class '${className}' at line ${i + 1} needs documentation`);
      }
    }
  }
  
  // Generate suggestions
  if (functionCount > 0 && documentedFunctions / functionCount < 0.5) {
    suggestions.push('Consider adding JSDoc comments for better code documentation');
    suggestions.push('Document function parameters and return values');
  }
  
  if (!content.includes('README') && filePath.includes('src')) {
    suggestions.push('Consider adding a README file for this module');
  }
  
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    suggestions.push('Use TypeScript types as inline documentation');
  }
  
  return { missing, suggestions };
}

export { router as ragRouter };
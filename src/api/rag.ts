import { Router, Request, Response } from 'express';
import { containerManager } from '../lib/containerManager.js';
import { ErrorCode } from '../types/index.js';

const router = Router();

/**
 * POST /api/v1/rag/:containerId/search
 * Search for relevant code snippets using natural language
 */
router.post('/:containerId/search', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { query, limit = 10, includeContext = true } = req.body;
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

    console.log(`🔍 RAG search query: "${query}" in container ${containerId}`);

    const results = await performRAGSearch(session.container, {
      query,
      limit,
      includeContext
    });

    res.json({
      status: 'success',
      data: {
        query: query,
        results: results,
        totalResults: results.length,
        searchTime: Date.now(),
        containerId: containerId
      }
    });

  } catch (error) {
    console.error('RAG search error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to perform search'
      }
    });
  }
});

/**
 * POST /api/v1/rag/:containerId/index
 * Index the codebase for search
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

    console.log(`📚 Indexing codebase in container ${containerId}`);

    const indexStats = await indexCodebase(session.container, {
      paths,
      excludePatterns
    });

    res.json({
      status: 'success',
      data: {
        ...indexStats,
        containerId: containerId,
        indexedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Codebase indexing error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to index codebase'
      }
    });
  }
});

// Helper functions for RAG operations

interface RAGSearchOptions {
  query: string;
  limit: number;
  includeContext: boolean;
}

interface RAGSearchResult {
  file: string;
  snippet: string;
  line: number;
  score: number;
  context?: {
    before: string[];
    after: string[];
  };
}

async function performRAGSearch(container: any, options: RAGSearchOptions): Promise<RAGSearchResult[]> {
  try {
    const { query, limit, includeContext } = options;
    
    console.log(`Performing enhanced RAG search for: "${query}"`);
    
    // Enhanced implementation with better semantic matching
    // In a production system, this would use:
    // - Vector embeddings for semantic search
    // - Proper indexing (ElasticSearch, Pinecone, etc.)
    // - Code parsing and AST analysis
    // - Context-aware chunking
    
    const results: RAGSearchResult[] = [];
    
    // Get list of code files with improved filtering
    const codeFiles = await findCodeFiles(container);
    
    // Prioritize file types based on query
    const prioritizedFiles = prioritizeFilesByQuery(codeFiles, query);
    
    // Search in each file with enhanced matching
    for (const file of prioritizedFiles.slice(0, Math.min(100, prioritizedFiles.length))) {
      try {
        const content = await container.fs.readFile(file, 'utf-8');
        const lines = content.split('\n');
        
        // Enhanced search with multiple strategies
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineLower = line.toLowerCase();
          
          // Multi-strategy matching
          const matchStrategies = [
            // Exact match
            () => lineLower.includes(queryLower),
            // Word matches
            () => queryWords.some(word => lineLower.includes(word)),
            // Semantic patterns
            () => isSemanticMatch(line, query),
            // Code structure matches
            () => isCodeStructureMatch(line, query),
            // Variable/function name matches
            () => isIdentifierMatch(line, query)
          ];
          
          const matches = matchStrategies.filter(strategy => strategy());
          
          if (matches.length > 0) {
            const result: RAGSearchResult = {
              file: file,
              snippet: line.trim(),
              line: i + 1,
              score: calculateEnhancedRelevanceScore(line, query, file, matches.length)
            };
            
            // Add context if requested
            if (includeContext) {
              result.context = {
                before: lines.slice(Math.max(0, i - 3), i).map((l: string) => l.trim()),
                after: lines.slice(i + 1, Math.min(lines.length, i + 4)).map((l: string) => l.trim())
              };
            }
            
            results.push(result);
            
            if (results.length >= limit * 2) { // Get more results for better sorting
              break;
            }
          }
        }
        
        if (results.length >= limit * 2) {
          break;
        }
      } catch (fileError) {
        console.warn(`Could not search in file ${file}:`, fileError);
      }
    }
    
    // Sort by relevance score and deduplicate
    const uniqueResults = deduplicateResults(results);
    uniqueResults.sort((a, b) => b.score - a.score);
    
    return uniqueResults.slice(0, limit);
    
  } catch (error) {
    console.error('RAG search error:', error);
    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function prioritizeFilesByQuery(files: string[], query: string): string[] {
  const queryLower = query.toLowerCase();
  
  // File type priorities based on query
  const priorities = new Map<string, number>();
  
  for (const file of files) {
    const ext = file.split('.').pop()?.toLowerCase() || '';
    const fileName = file.toLowerCase();
    
    let priority = 1;
    
    // Boost priority based on query content
    if (queryLower.includes('component') || queryLower.includes('react')) {
      if (ext === 'jsx' || ext === 'tsx') priority += 3;
    }
    
    if (queryLower.includes('api') || queryLower.includes('endpoint')) {
      if (fileName.includes('api') || fileName.includes('route')) priority += 3;
    }
    
    if (queryLower.includes('test') || queryLower.includes('spec')) {
      if (fileName.includes('test') || fileName.includes('spec')) priority += 3;
    }
    
    if (queryLower.includes('config') || queryLower.includes('setting')) {
      if (fileName.includes('config') || ext === 'json' || ext === 'yml') priority += 3;
    }
    
    // Boost TypeScript/JavaScript files for most queries
    if (ext === 'ts' || ext === 'js' || ext === 'tsx' || ext === 'jsx') {
      priority += 1;
    }
    
    priorities.set(file, priority);
  }
  
  // Sort by priority
  return files.sort((a, b) => (priorities.get(b) || 0) - (priorities.get(a) || 0));
}

function isCodeStructureMatch(line: string, query: string): boolean {
  const lineLower = line.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Enhanced code structure patterns
  const structurePatterns = [
    // Function patterns
    { query: ['function', 'method'], line: /function\s+\w+|const\s+\w+\s*=|=>\s*{|^\s*\w+\s*\(/i },
    // Class patterns
    { query: ['class'], line: /class\s+\w+|interface\s+\w+|type\s+\w+/i },
    // Import/export patterns
    { query: ['import', 'export'], line: /import\s+|export\s+|from\s+['"`]/i },
    // Error handling
    { query: ['error', 'exception', 'catch'], line: /try\s*{|catch\s*\(|throw\s+|Error\(/i },
    // Async patterns
    { query: ['async', 'promise', 'await'], line: /async\s+|await\s+|Promise\.|\.then\(|\.catch\(/i },
    // API patterns
    { query: ['api', 'request', 'response'], line: /app\.(get|post|put|delete)|router\.|fetch\(|axios\./i }
  ];
  
  for (const pattern of structurePatterns) {
    if (pattern.query.some(keyword => queryLower.includes(keyword))) {
      if (pattern.line.test(line)) {
        return true;
      }
    }
  }
  
  return false;
}

function isIdentifierMatch(line: string, query: string): boolean {
  // Extract identifiers from the query
  const queryWords = query.split(/\s+/).filter(word => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(word));
  
  if (queryWords.length === 0) return false;
  
  // Check if any query word appears as an identifier in the line
  const identifierPattern = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g;
  const lineIdentifiers = line.match(identifierPattern) || [];
  
  return queryWords.some(queryWord => 
    lineIdentifiers.some(identifier => 
      identifier.toLowerCase().includes(queryWord.toLowerCase()) ||
      queryWord.toLowerCase().includes(identifier.toLowerCase())
    )
  );
}

function calculateEnhancedRelevanceScore(line: string, query: string, filePath: string, matchCount: number): number {
  let score = 0;
  const lineLower = line.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Base score from match count
  score += matchCount * 5;
  
  // Exact match gets highest score
  if (lineLower.includes(queryLower)) {
    score += 15;
  }
  
  // Word matches
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  const lineWords = lineLower.split(/\s+/);
  
  for (const queryWord of queryWords) {
    if (lineWords.includes(queryWord)) {
      score += 8;
    }
    // Partial word matches
    if (lineWords.some(word => word.includes(queryWord) || queryWord.includes(word))) {
      score += 3;
    }
  }
  
  // File type bonuses
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  if (['ts', 'js', 'tsx', 'jsx'].includes(ext)) {
    score += 2;
  }
  
  // Code pattern bonuses
  if (line.includes('function') || line.includes('class') || line.includes('const') || line.includes('let')) {
    score += 3;
  }
  
  // Comment penalty (usually less relevant)
  if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
    score -= 5;
  }
  
  // Length penalties for very long/short lines
  if (line.length > 200) {
    score -= 3;
  }
  if (line.trim().length < 10) {
    score -= 2;
  }
  
  return Math.max(0, score);
}

function deduplicateResults(results: RAGSearchResult[]): RAGSearchResult[] {
  const seen = new Set<string>();
  const deduplicated: RAGSearchResult[] = [];
  
  for (const result of results) {
    const key = `${result.file}:${result.line}:${result.snippet.trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(result);
    }
  }
  
  return deduplicated;
}

async function indexCodebase(container: any, options: { paths: string[]; excludePatterns: string[] }) {
  try {
    const { paths, excludePatterns } = options;
    
    console.log(`Indexing codebase at paths:`, paths);
    
    let totalFiles = 0;
    let indexedFiles = 0;
    let totalLines = 0;
    
    for (const path of paths) {
      const files = await findCodeFiles(container, path, excludePatterns);
      totalFiles += files.length;
      
      for (const file of files) {
        try {
          const content = await container.fs.readFile(file, 'utf-8');
          const lines = content.split('\n');
          
          totalLines += lines.length;
          indexedFiles++;
          
          // In a production system, this would:
          // - Parse code using AST
          // - Generate embeddings for semantic search
          // - Store in vector database
          // - Index functions, classes, variables
          
        } catch (fileError) {
          console.warn(`Could not index file ${file}:`, fileError);
        }
      }
    }
    
    return {
      totalFiles,
      indexedFiles,
      totalLines,
      indexedPaths: paths,
      excludePatterns
    };
    
  } catch (error) {
    console.error('Indexing error:', error);
    throw new Error(`Indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function findCodeFiles(container: any, rootPath: string = '.', excludePatterns: string[] = []): Promise<string[]> {
  const codeFiles: string[] = [];
  const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.rb', '.php', '.swift', '.kt'];
  
  try {
    const findFiles = async (currentPath: string) => {
      try {
        const entries = await container.fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = `${currentPath}/${entry.name}`;
          
          // Skip excluded patterns
          if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
            continue;
          }
          
          if (entry.isDirectory()) {
            // Recursively search subdirectories
            await findFiles(fullPath);
          } else if (entry.isFile()) {
            // Check if it's a code file
            const hasCodeExtension = codeExtensions.some(ext => entry.name.endsWith(ext));
            if (hasCodeExtension) {
              codeFiles.push(fullPath);
            }
          }
        }
      } catch (dirError) {
        console.warn(`Could not read directory ${currentPath}:`, dirError);
      }
    };
    
    await findFiles(rootPath);
    
  } catch (error) {
    console.warn('Error finding code files:', error);
  }
  
  return codeFiles;
}

function isSemanticMatch(line: string, query: string): boolean {
  // Basic semantic matching (in production, would use embeddings)
  const lineLower = line.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Check for function/method patterns
  if (queryLower.includes('function') && (lineLower.includes('function') || lineLower.includes('=>'))) {
    return true;
  }
  
  // Check for class patterns
  if (queryLower.includes('class') && lineLower.includes('class ')) {
    return true;
  }
  
  // Check for import patterns
  if (queryLower.includes('import') && lineLower.includes('import')) {
    return true;
  }
  
  return false;
}

function calculateRelevanceScore(line: string, query: string): number {
  let score = 0;
  const lineLower = line.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match gets highest score
  if (lineLower.includes(queryLower)) {
    score += 10;
  }
  
  // Word matches
  const queryWords = queryLower.split(/\s+/);
  const lineWords = lineLower.split(/\s+/);
  
  for (const queryWord of queryWords) {
    if (lineWords.includes(queryWord)) {
      score += 5;
    }
  }
  
  // Bonus for code patterns
  if (line.includes('function') || line.includes('class') || line.includes('const') || line.includes('let')) {
    score += 2;
  }
  
  // Penalty for very long lines (likely not relevant snippets)
  if (line.length > 200) {
    score -= 2;
  }
  
  return Math.max(0, score);
}

export { router as ragRouter };
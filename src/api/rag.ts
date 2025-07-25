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

    const session = containerManager.getSession(containerId);
    
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

    const session = containerManager.getSession(containerId);
    
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
    
    console.log(`Performing RAG search for: "${query}"`);
    
    // Basic implementation: search for text matches in files
    // In a production system, this would use:
    // - Vector embeddings for semantic search
    // - Proper indexing (ElasticSearch, Pinecone, etc.)
    // - Code parsing and AST analysis
    // - Context-aware chunking
    
    const results: RAGSearchResult[] = [];
    
    // Get list of code files
    const codeFiles = await findCodeFiles(container);
    
    // Search in each file
    for (const file of codeFiles.slice(0, Math.min(50, codeFiles.length))) {
      try {
        const content = await container.fs.readFile(file, 'utf-8');
        const lines = content.split('\n');
        
        // Simple text search (in production, would use embeddings)
        const queryLower = query.toLowerCase();
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineLower = line.toLowerCase();
          
          // Check for matches
          if (lineLower.includes(queryLower) || 
              line.includes(query) ||
              isSemanticMatch(line, query)) {
            
            const result: RAGSearchResult = {
              file: file,
              snippet: line.trim(),
              line: i + 1,
              score: calculateRelevanceScore(line, query)
            };
            
            // Add context if requested
            if (includeContext) {
              result.context = {
                before: lines.slice(Math.max(0, i - 3), i).map((l: string) => l.trim()),
                after: lines.slice(i + 1, Math.min(lines.length, i + 4)).map((l: string) => l.trim())
              };
            }
            
            results.push(result);
            
            if (results.length >= limit) {
              break;
            }
          }
        }
        
        if (results.length >= limit) {
          break;
        }
      } catch (fileError) {
        console.warn(`Could not search in file ${file}:`, fileError);
      }
    }
    
    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, limit);
    
  } catch (error) {
    console.error('RAG search error:', error);
    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
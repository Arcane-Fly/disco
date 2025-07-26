import { parse } from '@babel/parser';
import _traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as ts from 'typescript';

// Use dynamic import for babel traverse
let traverse: typeof _traverse;
(async () => {
  const module = await import('@babel/traverse');
  traverse = module.default || module;
})();

export interface CodeElement {
  type: 'function' | 'class' | 'interface' | 'variable' | 'import' | 'export';
  name: string;
  file: string;
  line: number;
  column: number;
  signature?: string;
  documentation?: string;
  dependencies?: string[];
  complexity?: number;
}

export interface EnhancedRAGSearchResult {
  file: string;
  snippet: string;
  line: number;
  score: number;
  context?: {
    before: string[];
    after: string[];
  };
  codeElements?: CodeElement[];
  astMetadata?: {
    elementType: string;
    parentFunction?: string;
    parentClass?: string;
    complexity?: number;
  };
  semanticSimilarity?: number;
}

export interface RAGSearchOptions {
  query: string;
  limit: number;
  includeContext: boolean;
  useAST?: boolean;
  semanticSearch?: boolean;
  includeCodeSuggestions?: boolean;
}

export class EnhancedRAGService {
  private codeIndex: Map<string, CodeElement[]> = new Map();
  private fileContents: Map<string, string> = new Map();
  
  async indexCodebaseWithAST(container: any, options: { paths: string[]; excludePatterns: string[] }) {
    console.log('🧠 Enhanced RAG: Starting AST-based indexing...');
    
    const { paths, excludePatterns } = options;
    let totalFiles = 0;
    let indexedFiles = 0;
    let totalElements = 0;
    
    for (const path of paths) {
      const files = await this.findCodeFiles(container, path, excludePatterns);
      totalFiles += files.length;
      
      for (const file of files) {
        try {
          const content = await container.fs.readFile(file, 'utf-8');
          this.fileContents.set(file, content);
          
          const elements = await this.parseFileWithAST(file, content);
          this.codeIndex.set(file, elements);
          
          totalElements += elements.length;
          indexedFiles++;
          
          console.log(`📁 Indexed ${file}: ${elements.length} code elements`);
          
        } catch (error) {
          console.warn(`⚠️ Could not index file ${file}:`, error);
        }
      }
    }
    
    console.log(`✅ Enhanced RAG indexing complete: ${indexedFiles}/${totalFiles} files, ${totalElements} code elements`);
    
    return {
      totalFiles,
      indexedFiles,
      totalElements,
      indexedPaths: paths,
      excludePatterns
    };
  }
  
  async performEnhancedSearch(container: any, options: RAGSearchOptions): Promise<EnhancedRAGSearchResult[]> {
    console.log(`🔍 Enhanced RAG search: "${options.query}"`);
    
    const results: EnhancedRAGSearchResult[] = [];
    
    // Phase 1: AST-based semantic search
    if (options.useAST) {
      const astResults = await this.performASTSearch(options);
      results.push(...astResults);
    }
    
    // Phase 2: Traditional text search with enhanced scoring
    const textResults = await this.performEnhancedTextSearch(container, options);
    results.push(...textResults);
    
    // Phase 3: Code suggestions (if requested)
    if (options.includeCodeSuggestions) {
      const suggestions = await this.generateCodeSuggestions(options.query);
      results.push(...suggestions);
    }
    
    // Deduplicate and sort by relevance
    const uniqueResults = this.deduplicateResults(results);
    uniqueResults.sort((a, b) => (b.score + (b.semanticSimilarity || 0)) - (a.score + (a.semanticSimilarity || 0)));
    
    return uniqueResults.slice(0, options.limit);
  }
  
  private async parseFileWithAST(filePath: string, content: string): Promise<CodeElement[]> {
    const elements: CodeElement[] = [];
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    try {
      if (['ts', 'tsx', 'js', 'jsx'].includes(extension || '')) {
        return await this.parseJavaScriptFile(filePath, content);
      } else if (extension === 'py') {
        return await this.parsePythonFile(filePath, content);
      }
    } catch (error) {
      console.warn(`AST parsing failed for ${filePath}:`, error);
    }
    
    return elements;
  }
  
  private async parseJavaScriptFile(filePath: string, content: string): Promise<CodeElement[]> {
    const elements: CodeElement[] = [];
    const extension = filePath.split('.').pop()?.toLowerCase();
    const isTypeScript = ['ts', 'tsx'].includes(extension || '');
    
    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'asyncGenerators',
          'dynamicImport'
        ]
      });
      
      traverse(ast, {
        FunctionDeclaration(path) {
          const node = path.node;
          if (node.id) {
            elements.push({
              type: 'function',
              name: node.id.name,
              file: filePath,
              line: node.loc?.start.line || 0,
              column: node.loc?.start.column || 0,
              signature: generateFunctionSignature(node),
              complexity: calculateCyclomaticComplexity(path)
            });
          }
        },
        
        ArrowFunctionExpression(path) {
          const parent = path.parent;
          let name = 'anonymous';
          
          if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
            name = parent.id.name;
          } else if (t.isProperty(parent) && t.isIdentifier(parent.key)) {
            name = parent.key.name;
          }
          
          elements.push({
            type: 'function',
            name: name,
            file: filePath,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
            signature: generateArrowFunctionSignature(path.node),
            complexity: calculateCyclomaticComplexity(path)
          });
        },
        
        ClassDeclaration(path) {
          const node = path.node;
          if (node.id) {
            elements.push({
              type: 'class',
              name: node.id.name,
              file: filePath,
              line: node.loc?.start.line || 0,
              column: node.loc?.start.column || 0,
              signature: `class ${node.id.name}`,
              dependencies: extractClassDependencies(node)
            });
          }
        },
        
        TSInterfaceDeclaration(path) {
          const node = path.node;
          elements.push({
            type: 'interface',
            name: node.id.name,
            file: filePath,
            line: node.loc?.start.line || 0,
            column: node.loc?.start.column || 0,
            signature: `interface ${node.id.name}`
          });
        },
        
        VariableDeclarator(path) {
          const node = path.node;
          if (t.isIdentifier(node.id)) {
            elements.push({
              type: 'variable',
              name: node.id.name,
              file: filePath,
              line: node.loc?.start.line || 0,
              column: node.loc?.start.column || 0,
              signature: generateVariableSignature(node)
            });
          }
        },
        
        ImportDeclaration(path) {
          const node = path.node;
          const importNames = node.specifiers.map(spec => {
            if (t.isImportDefaultSpecifier(spec)) {
              return spec.local.name;
            } else if (t.isImportSpecifier(spec)) {
              return spec.local.name;
            }
            return '';
          }).filter(Boolean);
          
          for (const name of importNames) {
            elements.push({
              type: 'import',
              name: name,
              file: filePath,
              line: node.loc?.start.line || 0,
              column: node.loc?.start.column || 0,
              signature: `import ${name} from '${node.source.value}'`,
              dependencies: [node.source.value as string]
            });
          }
        }
      });
      
    } catch (error) {
      console.warn(`Failed to parse JavaScript/TypeScript file ${filePath}:`, error);
    }
    
    return elements;
  }
  
  private async parsePythonFile(filePath: string, content: string): Promise<CodeElement[]> {
    // Basic Python parsing (in production, would use a proper Python AST parser)
    const elements: CodeElement[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Function definitions
      const funcMatch = line.match(/^def\s+(\w+)\s*\(/);
      if (funcMatch) {
        elements.push({
          type: 'function',
          name: funcMatch[1],
          file: filePath,
          line: i + 1,
          column: 0,
          signature: line
        });
      }
      
      // Class definitions
      const classMatch = line.match(/^class\s+(\w+)/);
      if (classMatch) {
        elements.push({
          type: 'class',
          name: classMatch[1],
          file: filePath,
          line: i + 1,
          column: 0,
          signature: line
        });
      }
      
      // Import statements
      const importMatch = line.match(/^(?:from\s+\S+\s+)?import\s+(.+)/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(imp => imp.trim());
        for (const imp of imports) {
          elements.push({
            type: 'import',
            name: imp,
            file: filePath,
            line: i + 1,
            column: 0,
            signature: line
          });
        }
      }
    }
    
    return elements;
  }
  
  private async performASTSearch(options: RAGSearchOptions): Promise<EnhancedRAGSearchResult[]> {
    const results: EnhancedRAGSearchResult[] = [];
    const queryLower = options.query.toLowerCase();
    
    for (const [file, elements] of this.codeIndex) {
      for (const element of elements) {
        const score = this.calculateASTScore(element, options.query);
        
        if (score > 0) {
          const content = this.fileContents.get(file) || '';
          const lines = content.split('\n');
          const snippet = lines[element.line - 1] || '';
          
          results.push({
            file: element.file,
            snippet: snippet.trim(),
            line: element.line,
            score: score,
            codeElements: [element],
            astMetadata: {
              elementType: element.type,
              complexity: element.complexity
            },
            semanticSimilarity: this.calculateSemanticSimilarity(element, options.query)
          });
        }
      }
    }
    
    return results;
  }
  
  private async performEnhancedTextSearch(container: any, options: RAGSearchOptions): Promise<EnhancedRAGSearchResult[]> {
    // Enhanced version of the existing text search with improved scoring
    const results: EnhancedRAGSearchResult[] = [];
    const queryLower = options.query.toLowerCase();
    
    for (const [file, content] of this.fileContents) {
      const lines = content.split('\n');
      const elements = this.codeIndex.get(file) || [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLower = line.toLowerCase();
        
        if (this.isLineRelevant(line, options.query)) {
          const relevantElements = elements.filter(el => Math.abs(el.line - (i + 1)) <= 5);
          
          const result: EnhancedRAGSearchResult = {
            file: file,
            snippet: line.trim(),
            line: i + 1,
            score: this.calculateEnhancedScore(line, options.query, file),
            codeElements: relevantElements,
            semanticSimilarity: this.calculateTextSemanticSimilarity(line, options.query)
          };
          
          if (options.includeContext) {
            result.context = {
              before: lines.slice(Math.max(0, i - 3), i).map(l => l.trim()),
              after: lines.slice(i + 1, Math.min(lines.length, i + 4)).map(l => l.trim())
            };
          }
          
          results.push(result);
        }
      }
    }
    
    return results;
  }
  
  private async generateCodeSuggestions(query: string): Promise<EnhancedRAGSearchResult[]> {
    // AI-powered code suggestions based on query intent
    const suggestions: EnhancedRAGSearchResult[] = [];
    const queryLower = query.toLowerCase();
    
    // Pattern-based suggestions
    const patterns = [
      {
        keywords: ['function', 'method', 'create'],
        suggestion: `// AI Suggestion: Function template
function ${this.extractFunctionName(query)}() {
  // TODO: Implement function logic
  return;
}`,
        description: 'Function template based on query'
      },
      {
        keywords: ['class', 'component'],
        suggestion: `// AI Suggestion: Class template
class ${this.extractClassName(query)} {
  constructor() {
    // TODO: Initialize class
  }
}`,
        description: 'Class template based on query'
      },
      {
        keywords: ['api', 'endpoint', 'route'],
        suggestion: `// AI Suggestion: API endpoint template
router.get('/api/${this.extractEndpointName(query)}', async (req, res) => {
  try {
    // TODO: Implement endpoint logic
    res.json({ status: 'success', data: {} });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});`,
        description: 'API endpoint template based on query'
      }
    ];
    
    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => queryLower.includes(keyword))) {
        suggestions.push({
          file: '<AI Suggestion>',
          snippet: pattern.suggestion,
          line: 0,
          score: 15, // High score for AI suggestions
          semanticSimilarity: 0.9,
          astMetadata: {
            elementType: 'ai-suggestion'
          }
        });
      }
    }
    
    return suggestions;
  }
  
  // Helper methods
  
  private calculateASTScore(element: CodeElement, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const nameLower = element.name.toLowerCase();
    
    // Exact name match
    if (nameLower === queryLower) {
      score += 20;
    } else if (nameLower.includes(queryLower) || queryLower.includes(nameLower)) {
      score += 15;
    }
    
    // Type-specific bonuses
    if (queryLower.includes('function') && element.type === 'function') {
      score += 10;
    }
    if (queryLower.includes('class') && element.type === 'class') {
      score += 10;
    }
    if (queryLower.includes('import') && element.type === 'import') {
      score += 10;
    }
    
    // Complexity considerations
    if (element.complexity && element.complexity > 10) {
      score += 3; // Complex functions might be more important
    }
    
    return score;
  }
  
  private calculateSemanticSimilarity(element: CodeElement, query: string): number {
    // Simple semantic similarity (in production, would use embeddings)
    const keywords = query.toLowerCase().split(/\s+/);
    const elementText = `${element.name} ${element.signature || ''}`.toLowerCase();
    
    let matches = 0;
    for (const keyword of keywords) {
      if (elementText.includes(keyword)) {
        matches++;
      }
    }
    
    return keywords.length > 0 ? matches / keywords.length : 0;
  }
  
  private calculateTextSemanticSimilarity(line: string, query: string): number {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const lineWords = line.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    let matches = 0;
    for (const queryWord of queryWords) {
      if (lineWords.some(lineWord => lineWord.includes(queryWord) || queryWord.includes(lineWord))) {
        matches++;
      }
    }
    
    return queryWords.length > 0 ? matches / queryWords.length : 0;
  }
  
  private calculateEnhancedScore(line: string, query: string, filePath: string): number {
    let score = 0;
    const lineLower = line.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Enhanced scoring logic
    if (lineLower.includes(queryLower)) {
      score += 15;
    }
    
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    for (const word of queryWords) {
      if (lineLower.includes(word)) {
        score += 5;
      }
    }
    
    // Code pattern bonuses
    if (this.isCodeStructure(line)) {
      score += 3;
    }
    
    // File type bonuses
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (['ts', 'js', 'tsx', 'jsx'].includes(ext || '')) {
      score += 2;
    }
    
    return score;
  }
  
  private isLineRelevant(line: string, query: string): boolean {
    const lineLower = line.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Direct match
    if (lineLower.includes(queryLower)) {
      return true;
    }
    
    // Word matches
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    if (queryWords.some(word => lineLower.includes(word))) {
      return true;
    }
    
    // Semantic patterns
    return this.hasSemanticMatch(line, query);
  }
  
  private hasSemanticMatch(line: string, query: string): boolean {
    const lineLower = line.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Function patterns
    if (queryLower.includes('function') && (lineLower.includes('function') || lineLower.includes('=>'))) {
      return true;
    }
    
    // Class patterns
    if (queryLower.includes('class') && lineLower.includes('class ')) {
      return true;
    }
    
    return false;
  }
  
  private isCodeStructure(line: string): boolean {
    const codePatterns = [
      /function\s+\w+/i,
      /class\s+\w+/i,
      /const\s+\w+\s*=/i,
      /let\s+\w+\s*=/i,
      /var\s+\w+\s*=/i,
      /interface\s+\w+/i,
      /type\s+\w+/i,
      /import\s+/i,
      /export\s+/i
    ];
    
    return codePatterns.some(pattern => pattern.test(line));
  }
  
  private extractFunctionName(query: string): string {
    const words = query.split(/\s+/).filter(w => /^[a-zA-Z]\w*$/.test(w));
    return words.length > 0 ? words[words.length - 1] : 'myFunction';
  }
  
  private extractClassName(query: string): string {
    const words = query.split(/\s+/).filter(w => /^[a-zA-Z]\w*$/.test(w));
    const name = words.length > 0 ? words[words.length - 1] : 'MyClass';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  private extractEndpointName(query: string): string {
    const words = query.split(/\s+/).filter(w => /^[a-zA-Z]\w*$/.test(w));
    return words.length > 0 ? words[words.length - 1].toLowerCase() : 'endpoint';
  }
  
  private deduplicateResults(results: EnhancedRAGSearchResult[]): EnhancedRAGSearchResult[] {
    const seen = new Set<string>();
    const deduplicated: EnhancedRAGSearchResult[] = [];
    
    for (const result of results) {
      const key = `${result.file}:${result.line}:${result.snippet.trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(result);
      }
    }
    
    return deduplicated;
  }
  
  private async findCodeFiles(container: any, rootPath: string = '.', excludePatterns: string[] = []): Promise<string[]> {
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
              await findFiles(fullPath);
            } else if (entry.isFile()) {
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
}

export const enhancedRAG = new EnhancedRAGService();

// Helper functions for AST parsing

function generateFunctionSignature(node: any): string {
  const params = node.params.map((param: any) => {
    if (t.isIdentifier(param)) {
      return param.name;
    }
    return 'param';
  }).join(', ');
  
  return `function ${node.id?.name || 'anonymous'}(${params})`;
}

function generateArrowFunctionSignature(node: any): string {
  const params = node.params.map((param: any) => {
    if (t.isIdentifier(param)) {
      return param.name;
    }
    return 'param';
  }).join(', ');
  
  return `(${params}) => {}`;
}

function generateVariableSignature(node: any): string {
  return `${node.id?.name || 'variable'} = ...`;
}

function extractClassDependencies(node: any): string[] {
  const deps: string[] = [];
  
  if (node.superClass && t.isIdentifier(node.superClass)) {
    deps.push(node.superClass.name);
  }
  
  return deps;
}

function calculateCyclomaticComplexity(path: any): number {
  let complexity = 1; // Base complexity
  
  path.traverse({
    IfStatement: () => complexity++,
    WhileStatement: () => complexity++,
    ForStatement: () => complexity++,
    SwitchCase: () => complexity++,
    ConditionalExpression: () => complexity++,
    LogicalExpression: (innerPath: any) => {
      if (innerPath.node.operator === '&&' || innerPath.node.operator === '||') {
        complexity++;
      }
    }
  });
  
  return complexity;
}
/**
 * RAG Retrieve Node Implementation
 * 
 * Integrates with Disco's existing RAG API to retrieve relevant code snippets
 * using natural language queries with AST analysis.
 */

/**
 * Input parameters for RAG retrieve operation
 */
export interface RAGRetrieveInput {
  /** The container ID to search within */
  containerId: string;
  /** Natural language search query */
  query: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Include surrounding code context */
  includeContext?: boolean;
  /** Use AST analysis for better results */
  useAST?: boolean;
  /** Enable semantic search */
  semanticSearch?: boolean;
  /** Include code suggestions */
  includeCodeSuggestions?: boolean;
  /** Authentication token for API access */
  authToken?: string;
}

/**
 * Output from RAG retrieve operation
 */
export interface RAGRetrieveOutput {
  /** Retrieved documents/code snippets */
  documents: Array<{
    path: string;
    content: string;
    score: number;
    lineNumbers?: { start: number; end: number };
    context?: string;
    [key: string]: any;
  }>;
  /** Total number of results found */
  totalResults: number;
  /** Search query that was executed */
  query: string;
  /** Container ID that was searched */
  containerId: string;
  /** Features used in the search */
  features: {
    astAnalysis: boolean;
    semanticSearch: boolean;
    codeSuggestions: boolean;
  };
}

/**
 * RAG Retrieve Node Executor
 * 
 * Executes RAG retrieve operations by calling Disco's RAG API.
 * This node type enables workflows to search and retrieve relevant
 * code snippets from WebContainer filesystems.
 */
export class RAGRetrieveNode {
  private baseUrl: string;
  
  /**
   * Create a new RAG retrieve node executor
   * 
   * @param baseUrl - Base URL for the API (defaults to relative path)
   */
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Execute RAG retrieve operation
   * 
   * @param inputs - Input parameters for the retrieve operation
   * @returns Retrieved documents and metadata
   * 
   * @throws Error if the API call fails or parameters are invalid
   * 
   * @example
   * ```typescript
   * const ragNode = new RAGRetrieveNode();
   * const result = await ragNode.execute({
   *   containerId: 'container-123',
   *   query: 'How to use WebContainers?',
   *   limit: 5,
   *   authToken: 'Bearer xyz'
   * });
   * console.log(result.documents);
   * ```
   */
  async execute(inputs: RAGRetrieveInput): Promise<RAGRetrieveOutput> {
    // Validate required inputs
    if (!inputs.containerId) {
      throw new Error('RAGRetrieveNode: containerId is required');
    }
    if (!inputs.query || typeof inputs.query !== 'string') {
      throw new Error('RAGRetrieveNode: query must be a non-empty string');
    }
    
    // Set default values
    const {
      containerId,
      query,
      limit = 10,
      includeContext = true,
      useAST = true,
      semanticSearch = true,
      includeCodeSuggestions = true,
      authToken,
    } = inputs;
    
    try {
      // Construct API endpoint
      const url = `${this.baseUrl}/api/v1/rag/${containerId}/search`;
      
      // Prepare request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') 
          ? authToken 
          : `Bearer ${authToken}`;
      }
      
      // Make API request
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          limit,
          includeContext,
          useAST,
          semanticSearch,
          includeCodeSuggestions,
        }),
      });
      
      // Check response status
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `RAG API request failed with status ${response.status}: ${errorText}`
        );
      }
      
      // Parse response
      const data = await response.json();
      
      // Validate response structure
      if (data.status !== 'success' || !data.data) {
        throw new Error(
          `RAG API returned invalid response: ${JSON.stringify(data)}`
        );
      }
      
      // Return formatted output
      return {
        documents: data.data.results || [],
        totalResults: data.data.totalResults || 0,
        query: data.data.query || query,
        containerId: data.data.containerId || containerId,
        features: data.data.features || {
          astAnalysis: useAST,
          semanticSearch: semanticSearch,
          codeSuggestions: includeCodeSuggestions,
        },
      };
    } catch (error) {
      // Re-throw with context
      if (error instanceof Error) {
        throw new Error(`RAGRetrieveNode execution failed: ${error.message}`);
      }
      throw new Error(`RAGRetrieveNode execution failed: ${String(error)}`);
    }
  }
  
  /**
   * Create a PocketFlow-compatible function for this node
   * 
   * @returns A function that can be used with PocketFlow.addNode()
   * 
   * @example
   * ```typescript
   * const ragNode = new RAGRetrieveNode();
   * flow.addNode('rag_retrieve', ragNode.createPocketFlowFunction());
   * ```
   */
  createPocketFlowFunction() {
    return async (state: any) => {
      // Extract inputs from state
      // Look for inputs in various possible locations
      const inputs: RAGRetrieveInput = {
        containerId: state.containerId || state.rag_retrieve?.containerId,
        query: state.query || state.rag_retrieve?.query,
        limit: state.limit || state.rag_retrieve?.limit,
        includeContext: state.includeContext ?? state.rag_retrieve?.includeContext,
        useAST: state.useAST ?? state.rag_retrieve?.useAST,
        semanticSearch: state.semanticSearch ?? state.rag_retrieve?.semanticSearch,
        includeCodeSuggestions: state.includeCodeSuggestions ?? state.rag_retrieve?.includeCodeSuggestions,
        authToken: state.authToken || state.rag_retrieve?.authToken,
      };
      
      // Execute the node
      return await this.execute(inputs);
    };
  }
}

export default RAGRetrieveNode;

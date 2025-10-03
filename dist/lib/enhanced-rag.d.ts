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
export declare class EnhancedRAGService {
    private codeIndex;
    private fileContents;
    indexCodebaseWithAST(container: any, options: {
        paths: string[];
        excludePatterns: string[];
    }): Promise<{
        totalFiles: number;
        indexedFiles: number;
        totalElements: number;
        indexedPaths: string[];
        excludePatterns: string[];
    }>;
    performEnhancedSearch(container: any, options: RAGSearchOptions): Promise<EnhancedRAGSearchResult[]>;
    private parseFileWithAST;
    private parseJavaScriptFile;
    private parsePythonFile;
    private performASTSearch;
    private performEnhancedTextSearch;
    private generateCodeSuggestions;
    private calculateASTScore;
    private calculateSemanticSimilarity;
    private calculateTextSemanticSimilarity;
    private calculateEnhancedScore;
    private isLineRelevant;
    private hasSemanticMatch;
    private isCodeStructure;
    private extractFunctionName;
    private extractClassName;
    private extractEndpointName;
    private deduplicateResults;
    private findCodeFiles;
}
export declare const enhancedRAG: EnhancedRAGService;
//# sourceMappingURL=enhanced-rag.d.ts.map
/**
 * Advanced Conflict Resolution System
 * Implements intelligent conflict detection and multiple resolution strategies
 */
export interface ConflictResolution {
    strategy: 'last-write-wins' | 'merge' | 'manual' | 'smart-merge' | 'semantic-merge';
    resolvedContent: string;
    conflictedSections?: Array<{
        start: number;
        end: number;
        versions: string[];
        resolution?: 'auto' | 'manual';
        confidence?: number;
    }>;
    metadata?: {
        conflictType: 'textual' | 'semantic' | 'structural';
        severity: 'low' | 'medium' | 'high';
        autoResolved: boolean;
        userId: string;
        timestamp: Date;
    };
}
export interface DiffResult {
    type: 'addition' | 'deletion' | 'modification';
    lineNumber: number;
    content: string;
    confidence: number;
}
export interface MergeContext {
    baseContent: string;
    localContent: string;
    remoteContent: string;
    filePath: string;
    fileType: string;
    lastModified: Date;
}
export declare class AdvancedConflictResolver {
    private diffThreshold;
    private semanticPatterns;
    constructor();
    private initializeSemanticPatterns;
    /**
     * Main conflict resolution method with multiple strategies
     */
    resolveConflict(baseContent: string, localContent: string, remoteContent: string, filePath: string, userId: string): Promise<ConflictResolution>;
    /**
     * Smart merge using line-by-line analysis with contextual understanding
     */
    private attemptSmartMerge;
    /**
     * Semantic merge for code files using AST-like pattern matching
     */
    private attemptSemanticMerge;
    /**
     * Generate manual resolution with detailed conflict information
     */
    private generateManualResolution;
    /**
     * Resolve individual line conflicts with contextual analysis
     */
    private resolveLineConflict;
    /**
     * Extract semantic blocks from content using patterns
     */
    private extractSemanticBlocks;
    /**
     * Helper methods
     */
    private getFileType;
    private supportsSemanticMerge;
    private generateBlockId;
    private isCommentOnlyChange;
    private isImportStatement;
    private mergeImportStatements;
    private createSemanticConflictBlock;
    private generateDetailedConflictMarkers;
    private isVariableAssignment;
    private extractVariableName;
    private isSimpleVariableAssignmentConflict;
}
export declare const conflictResolver: AdvancedConflictResolver;
//# sourceMappingURL=conflictResolver.d.ts.map
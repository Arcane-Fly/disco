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

export class AdvancedConflictResolver {
  private diffThreshold = 0.6; // Confidence threshold for auto-resolution (lowered for stricter conflict detection)
  private semanticPatterns: Map<string, RegExp[]> = new Map();

  constructor() {
    this.initializeSemanticPatterns();
  }

  private initializeSemanticPatterns() {
    // JavaScript/TypeScript patterns
    this.semanticPatterns.set('javascript', [
      /^(import|export)\s+.*$/gm, // Import/export statements
      /^(function|const|let|var)\s+\w+/gm, // Function/variable declarations
      /^(class|interface)\s+\w+/gm, // Class/interface declarations
      /^\s*\/\*[\s\S]*?\*\/\s*$/gm, // Block comments
      /^\s*\/\/.*$/gm, // Line comments
    ]);

    // JSON patterns
    this.semanticPatterns.set('json', [
      /^\s*"[\w-]+"\s*:\s*[{[].*$/gm, // Object/array properties
      /^\s*"[\w-]+"\s*:\s*".*"[,]?$/gm, // String properties
      /^\s*"[\w-]+"\s*:\s*\d+[,]?$/gm, // Number properties
    ]);

    // Markdown patterns
    this.semanticPatterns.set('markdown', [
      /^#{1,6}\s+.*$/gm, // Headers
      /^-\s+.*$/gm, // List items
      /^\d+\.\s+.*$/gm, // Numbered lists
      /^```[\s\S]*?```$/gm, // Code blocks
    ]);
  }

  /**
   * Main conflict resolution method with multiple strategies
   */
  public async resolveConflict(
    baseContent: string,
    localContent: string,
    remoteContent: string,
    filePath: string,
    userId: string
  ): Promise<ConflictResolution> {
    const context: MergeContext = {
      baseContent,
      localContent,
      remoteContent,
      filePath,
      fileType: this.getFileType(filePath),
      lastModified: new Date(),
    };

    // Try smart merge first
    const smartMergeResult = await this.attemptSmartMerge(context);
    if (smartMergeResult.metadata?.autoResolved) {
      return {
        ...smartMergeResult,
        metadata: {
          ...smartMergeResult.metadata,
          userId,
          timestamp: new Date(),
        },
      };
    }

    // If smart merge couldn't auto-resolve, try semantic merge for supported file types
    // But skip semantic merge for simple variable assignments that should be handled manually
    if (
      !smartMergeResult.metadata?.autoResolved &&
      this.supportsSemanticMerge(context.fileType) &&
      !this.isSimpleVariableAssignmentConflict(context)
    ) {
      const semanticMergeResult = await this.attemptSemanticMerge(context);
      if (semanticMergeResult.metadata?.autoResolved) {
        return {
          ...semanticMergeResult,
          metadata: {
            ...semanticMergeResult.metadata,
            userId,
            timestamp: new Date(),
          },
        };
      }
    }

    // Fall back to manual resolution with detailed conflict information
    return this.generateManualResolution(context, userId);
  }

  /**
   * Smart merge using line-by-line analysis with contextual understanding
   */
  private async attemptSmartMerge(context: MergeContext): Promise<ConflictResolution> {
    const baseLines = context.baseContent.split('\n');
    const localLines = context.localContent.split('\n');
    const remoteLines = context.remoteContent.split('\n');

    const mergedLines: string[] = [];
    const conflicts: Array<{
      start: number;
      end: number;
      versions: string[];
      resolution?: 'auto' | 'manual';
      confidence?: number;
    }> = [];

    let i = 0,
      j = 0,
      k = 0;
    let autoResolved = true;

    while (i < baseLines.length || j < localLines.length || k < remoteLines.length) {
      const baseLine = baseLines[i] || '';
      const localLine = localLines[j] || '';
      const remoteLine = remoteLines[k] || '';

      if (baseLine === localLine && baseLine === remoteLine) {
        // No conflict
        mergedLines.push(baseLine);
        i++;
        j++;
        k++;
      } else if (baseLine === localLine && baseLine !== remoteLine) {
        // Remote change only
        mergedLines.push(remoteLine);
        i++;
        j++;
        k++;
      } else if (baseLine === remoteLine && baseLine !== localLine) {
        // Local change only
        mergedLines.push(localLine);
        i++;
        j++;
        k++;
      } else {
        // Conflict detected
        const conflictResolution = this.resolveLineConflict(
          baseLine,
          localLine,
          remoteLine,
          context.fileType
        );

        if (conflictResolution.confidence >= this.diffThreshold) {
          mergedLines.push(conflictResolution.resolvedLine);
          conflicts.push({
            start: mergedLines.length - 1,
            end: mergedLines.length - 1,
            versions: [localLine, remoteLine],
            resolution: 'auto',
            confidence: conflictResolution.confidence,
          });
        } else {
          // Manual resolution required
          mergedLines.push(`<<<<<<< LOCAL\n${localLine}\n=======\n${remoteLine}\n>>>>>>> REMOTE`);
          conflicts.push({
            start: mergedLines.length - 4,
            end: mergedLines.length - 1,
            versions: [localLine, remoteLine],
            resolution: 'manual',
            confidence: conflictResolution.confidence,
          });
          autoResolved = false;
        }
        i++;
        j++;
        k++;
      }
    }

    return {
      strategy: 'smart-merge',
      resolvedContent: mergedLines.join('\n'),
      conflictedSections: conflicts,
      metadata: {
        conflictType: 'textual',
        severity: autoResolved ? 'low' : 'medium',
        autoResolved,
        userId: '',
        timestamp: new Date(),
      },
    };
  }

  /**
   * Semantic merge for code files using AST-like pattern matching
   */
  private async attemptSemanticMerge(context: MergeContext): Promise<ConflictResolution> {
    const patterns = this.semanticPatterns.get(context.fileType) || [];

    const baseSemanticBlocks = this.extractSemanticBlocks(context.baseContent, patterns);
    const localSemanticBlocks = this.extractSemanticBlocks(context.localContent, patterns);
    const remoteSemanticBlocks = this.extractSemanticBlocks(context.remoteContent, patterns);

    const mergedBlocks: Array<{ content: string; source: 'base' | 'local' | 'remote' | 'merged' }> =
      [];
    const conflicts: Array<{
      start: number;
      end: number;
      versions: string[];
      resolution?: 'auto' | 'manual';
      confidence?: number;
    }> = [];

    // Merge semantic blocks intelligently
    const allBlockIds = new Set([
      ...baseSemanticBlocks.map(b => b.id),
      ...localSemanticBlocks.map(b => b.id),
      ...remoteSemanticBlocks.map(b => b.id),
    ]);

    let autoResolved = true;

    for (const blockId of allBlockIds) {
      const baseBlock = baseSemanticBlocks.find(b => b.id === blockId);
      const localBlock = localSemanticBlocks.find(b => b.id === blockId);
      const remoteBlock = remoteSemanticBlocks.find(b => b.id === blockId);

      if (baseBlock && localBlock && remoteBlock) {
        if (localBlock.content === remoteBlock.content) {
          // No conflict
          mergedBlocks.push({ content: localBlock.content, source: 'local' });
        } else if (baseBlock.content === localBlock.content) {
          // Remote change only
          mergedBlocks.push({ content: remoteBlock.content, source: 'remote' });
        } else if (baseBlock.content === remoteBlock.content) {
          // Local change only
          mergedBlocks.push({ content: localBlock.content, source: 'local' });
        } else {
          // Semantic conflict - check if it's a variable assignment that should require manual resolution
          if (
            this.isVariableAssignment(localBlock.content, context.fileType) &&
            this.isVariableAssignment(remoteBlock.content, context.fileType)
          ) {
            const localVar = this.extractVariableName(localBlock.content);
            const remoteVar = this.extractVariableName(remoteBlock.content);

            if (localVar === remoteVar && localBlock.content !== remoteBlock.content) {
              // Same variable, different values - requires manual resolution
              const conflictBlock = this.createSemanticConflictBlock(
                localBlock.content,
                remoteBlock.content
              );
              mergedBlocks.push({ content: conflictBlock, source: 'merged' });
              conflicts.push({
                start: mergedBlocks.length - 1,
                end: mergedBlocks.length - 1,
                versions: [localBlock.content, remoteBlock.content],
                resolution: 'manual',
                confidence: 0.1,
              });
              autoResolved = false;
              continue;
            }
          }

          // Other semantic conflicts - requires manual resolution
          const conflictBlock = this.createSemanticConflictBlock(
            localBlock.content,
            remoteBlock.content
          );
          mergedBlocks.push({ content: conflictBlock, source: 'merged' });
          conflicts.push({
            start: mergedBlocks.length - 1,
            end: mergedBlocks.length - 1,
            versions: [localBlock.content, remoteBlock.content],
            resolution: 'manual',
            confidence: 0.3,
          });
          autoResolved = false;
        }
      } else if (localBlock && !remoteBlock) {
        // Local addition
        mergedBlocks.push({ content: localBlock.content, source: 'local' });
      } else if (remoteBlock && !localBlock) {
        // Remote addition
        mergedBlocks.push({ content: remoteBlock.content, source: 'remote' });
      }
    }

    return {
      strategy: 'semantic-merge',
      resolvedContent: mergedBlocks.map(b => b.content).join('\n'),
      conflictedSections: conflicts,
      metadata: {
        conflictType: 'semantic',
        severity: autoResolved ? 'low' : 'high',
        autoResolved,
        userId: '',
        timestamp: new Date(),
      },
    };
  }

  /**
   * Generate manual resolution with detailed conflict information
   */
  private generateManualResolution(context: MergeContext, userId: string): ConflictResolution {
    const conflictMarkers = this.generateDetailedConflictMarkers(
      context.localContent,
      context.remoteContent
    );

    return {
      strategy: 'manual',
      resolvedContent: conflictMarkers,
      conflictedSections: [
        {
          start: 0,
          end: conflictMarkers.split('\n').length - 1,
          versions: [context.localContent, context.remoteContent],
          resolution: 'manual',
          confidence: 0,
        },
      ],
      metadata: {
        conflictType: 'structural',
        severity: 'high',
        autoResolved: false,
        userId,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Resolve individual line conflicts with contextual analysis
   */
  private resolveLineConflict(
    baseLine: string,
    localLine: string,
    remoteLine: string,
    fileType: string
  ): { resolvedLine: string; confidence: number } {
    // Check for variable assignment conflicts (should require manual resolution)
    if (
      this.isVariableAssignment(localLine, fileType) &&
      this.isVariableAssignment(remoteLine, fileType)
    ) {
      const localVar = this.extractVariableName(localLine);
      const remoteVar = this.extractVariableName(remoteLine);

      if (localVar === remoteVar && localLine !== remoteLine) {
        // Same variable, different values - requires manual resolution
        return {
          resolvedLine: localLine,
          confidence: 0.1,
        };
      }
    }

    // Check for comment-only changes
    if (this.isCommentOnlyChange(localLine, remoteLine, fileType)) {
      return {
        resolvedLine: localLine.length > remoteLine.length ? localLine : remoteLine,
        confidence: 0.9,
      };
    }

    // Check for whitespace-only changes
    if (localLine.trim() === remoteLine.trim()) {
      return {
        resolvedLine: localLine,
        confidence: 0.95,
      };
    }

    // Check for import/require statement changes
    if (
      this.isImportStatement(localLine, fileType) &&
      this.isImportStatement(remoteLine, fileType)
    ) {
      return {
        resolvedLine: this.mergeImportStatements(localLine, remoteLine),
        confidence: 0.8,
      };
    }

    // Default to lower confidence for manual review
    return {
      resolvedLine: localLine,
      confidence: 0.2,
    };
  }

  /**
   * Extract semantic blocks from content using patterns
   */
  private extractSemanticBlocks(
    content: string,
    patterns: RegExp[]
  ): Array<{ id: string; content: string }> {
    const blocks: Array<{ id: string; content: string }> = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          blocks.push({
            id: this.generateBlockId(line),
            content: line,
          });
          break;
        }
      }
    }

    return blocks;
  }

  /**
   * Helper methods
   */
  private getFileType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';

    const typeMapping: { [key: string]: string } = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'javascript',
      tsx: 'javascript',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'cpp',
    };

    return typeMapping[extension] || 'text';
  }

  private supportsSemanticMerge(fileType: string): boolean {
    return this.semanticPatterns.has(fileType);
  }

  private generateBlockId(content: string): string {
    // Simple hash-like ID generation
    return content.replace(/\s+/g, '_').substring(0, 30);
  }

  private isCommentOnlyChange(local: string, remote: string, fileType: string): boolean {
    const commentPatterns: { [key: string]: RegExp } = {
      javascript: /^\s*(\/\/|\/\*|\*)/,
      python: /^\s*#/,
      java: /^\s*(\/\/|\/\*|\*)/,
    };

    const pattern = commentPatterns[fileType];
    return pattern ? pattern.test(local) && pattern.test(remote) : false;
  }

  private isImportStatement(line: string, fileType: string): boolean {
    const importPatterns: { [key: string]: RegExp } = {
      javascript: /^\s*(import|export|require)/,
      python: /^\s*(import|from\s+.*\s+import)/,
      java: /^\s*import\s+/,
    };

    const pattern = importPatterns[fileType];
    return pattern ? pattern.test(line) : false;
  }

  private mergeImportStatements(local: string, remote: string): string {
    // Simple merge for import statements - prefer the one with more imports
    return local.length > remote.length ? local : remote;
  }

  private createSemanticConflictBlock(localContent: string, remoteContent: string): string {
    return `<<<<<<< LOCAL (semantic conflict)
${localContent}
=======
${remoteContent}
>>>>>>> REMOTE (semantic conflict)`;
  }

  private generateDetailedConflictMarkers(localContent: string, remoteContent: string): string {
    return `<<<<<<< LOCAL CHANGES
${localContent}
=======
${remoteContent}
>>>>>>> REMOTE CHANGES`;
  }

  private isVariableAssignment(line: string, fileType: string): boolean {
    const assignmentPatterns: { [key: string]: RegExp } = {
      javascript: /^\s*(const|let|var)\s+\w+\s*=|^\s*\w+\s*=/,
      python: /^\s*\w+\s*=/,
      java: /^\s*(final\s+)?\w+\s+\w+\s*=/,
    };

    const pattern = assignmentPatterns[fileType] || /^\s*\w+\s*=/;
    return pattern.test(line);
  }

  private extractVariableName(line: string): string {
    const match = line.match(/^\s*(?:const|let|var)?\s*(\w+)\s*=/);
    return match ? match[1] : '';
  }

  private isSimpleVariableAssignmentConflict(context: MergeContext): boolean {
    const localLines = context.localContent.split('\n');
    const remoteLines = context.remoteContent.split('\n');

    // Check if both local and remote are single-line variable assignments
    if (localLines.length === 1 && remoteLines.length === 1) {
      const localLine = localLines[0].trim();
      const remoteLine = remoteLines[0].trim();

      if (
        this.isVariableAssignment(localLine, context.fileType) &&
        this.isVariableAssignment(remoteLine, context.fileType)
      ) {
        const localVar = this.extractVariableName(localLine);
        const remoteVar = this.extractVariableName(remoteLine);

        // Same variable name but different content = simple assignment conflict
        return localVar === remoteVar && localLine !== remoteLine;
      }
    }

    return false;
  }
}

export const conflictResolver = new AdvancedConflictResolver();

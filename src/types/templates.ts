/**
 * Template Type Definitions for PocketFlow Phase 3
 * 
 * Type definitions for workflow templates, including template metadata,
 * validation, import/export, and marketplace features.
 */

/**
 * Template category
 */
export type TemplateCategory = 
  | 'RAG'
  | 'Agent'
  | 'Multi-Agent'
  | 'Utility'
  | 'Integration'
  | 'Full-Stack';

/**
 * Template difficulty level
 */
export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Template node configuration
 */
export interface TemplateNode {
  /** Node identifier */
  id: string;
  /** Node type from registry */
  type: string;
  /** Display name */
  label: string;
  /** Node position in visual editor */
  position?: { x: number; y: number };
  /** Node configuration */
  config: Record<string, any>;
  /** Node description */
  description?: string;
}

/**
 * Template edge/connection
 */
export interface TemplateEdge {
  /** Source node ID */
  from: string;
  /** Target node ID */
  to: string;
  /** Edge label */
  label?: string;
  /** Condition for edge execution */
  condition?: string;
}

/**
 * Template input parameter
 */
export interface TemplateParameter {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** Parameter description */
  description: string;
  /** Whether parameter is required */
  required: boolean;
  /** Default value */
  default?: any;
  /** Validation rules */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

/**
 * Template example
 */
export interface TemplateExample {
  /** Example title */
  title: string;
  /** Example description */
  description: string;
  /** Input parameters */
  inputs: Record<string, any>;
  /** Expected output */
  expectedOutput?: any;
  /** Code snippet */
  code?: string;
}

/**
 * Template metadata
 */
export interface TemplateMetadata {
  /** Template unique identifier */
  id: string;
  /** Template name */
  name: string;
  /** Short description */
  description: string;
  /** Long description with markdown */
  longDescription?: string;
  /** Template version (semver) */
  version: string;
  /** Template author */
  author: string;
  /** Template category */
  category: TemplateCategory;
  /** Tags for search */
  tags: string[];
  /** Difficulty level */
  difficulty: TemplateDifficulty;
  /** Creation date */
  createdAt: string;
  /** Last update date */
  updatedAt: string;
  /** License */
  license?: string;
  /** Repository URL */
  repository?: string;
  /** Documentation URL */
  documentation?: string;
  /** Icon or emoji */
  icon?: string;
}

/**
 * Template statistics
 */
export interface TemplateStats {
  /** Number of downloads */
  downloads: number;
  /** Average rating (0-5) */
  rating: number;
  /** Number of ratings */
  ratingCount: number;
  /** Number of forks */
  forks: number;
  /** Number of stars */
  stars: number;
}

/**
 * Complete workflow template
 */
export interface WorkflowTemplate {
  /** Template metadata */
  metadata: TemplateMetadata;
  /** Template statistics */
  stats?: TemplateStats;
  /** Input parameters */
  parameters: TemplateParameter[];
  /** Workflow nodes */
  nodes: TemplateNode[];
  /** Workflow edges */
  edges: TemplateEdge[];
  /** Usage examples */
  examples: TemplateExample[];
  /** Required node types */
  requiredNodeTypes: string[];
  /** Template variables */
  variables?: Record<string, any>;
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
  /** Whether template is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Template export format
 */
export type TemplateExportFormat = 'json' | 'typescript' | 'python' | 'go';

/**
 * Template export options
 */
export interface TemplateExportOptions {
  /** Export format */
  format: TemplateExportFormat;
  /** Include examples */
  includeExamples?: boolean;
  /** Include documentation */
  includeDocumentation?: boolean;
  /** Minify output */
  minify?: boolean;
}

/**
 * Template import result
 */
export interface TemplateImportResult {
  /** Imported template */
  template: WorkflowTemplate;
  /** Import warnings */
  warnings: string[];
  /** Whether any modifications were made during import */
  modified: boolean;
}

/**
 * Template marketplace filter
 */
export interface TemplateFilter {
  /** Filter by category */
  category?: TemplateCategory;
  /** Filter by tags */
  tags?: string[];
  /** Filter by difficulty */
  difficulty?: TemplateDifficulty;
  /** Search query */
  query?: string;
  /** Minimum rating */
  minRating?: number;
  /** Sort by */
  sortBy?: 'downloads' | 'rating' | 'recent' | 'popular';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Template marketplace listing
 */
export interface TemplateMarketplaceListing {
  /** Template */
  template: WorkflowTemplate;
  /** Whether template is featured */
  featured: boolean;
  /** Whether template is verified */
  verified: boolean;
  /** Template preview image */
  previewImage?: string;
}

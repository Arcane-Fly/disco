// Export centralized types
export * from './metrics.js';
export * from './theme.js';

// Auth types
export interface AuthStatusResponse {
  authenticated: boolean;
  authentication_required: boolean;
  available_methods: string[];
  github_oauth: {
    available?: boolean;
    configured: boolean;
    has_placeholders?: boolean;
    login_url?: string | null;
    callback_url?: string | null;
    setup_required?: boolean;
    client_id?: string;
    redirect_uri?: string;
  };
  api_key_auth?: {
    available: boolean;
    login_url: string;
  };
  token_verification?: {
    url: string;
  };
  token_refresh?: {
    url: string;
  };
  oauth_discovery?: {
    authorization_server: string;
    protected_resource: string;
  };
  setup_instructions?: {
    step_1: string;
    step_2: string;
    step_3: string;
    step_4: string;
    note: string;
  };
  user_id?: string;
  provider?: string;
  token_expires_at?: number;
  token_status?: string;
}

export interface JWTPayload {
  userId: string;
  provider?: string;
  email?: string;
  sub?: string;
  username?: string;
  name?: string;
  iat: number;
  exp: number;
}

// Container types
export interface ContainerSession {
  id: string;
  userId: string;
  container: any; // WebContainer instance - keeping as any due to external API complexity
  createdAt: Date;
  lastActive: Date;
  repositoryUrl?: string;
  status: 'initializing' | 'ready' | 'error' | 'terminated';
  url?: string;
  // Extended properties
  bootstrapConfig?: Record<string, unknown>;
  sessionId?: string;
}

export interface ContainerCreateRequest {
  userId: string;
  options?: {
    preWarm?: boolean;
    template?: string;
  };
}

export interface ContainerCreateResponse {
  containerId: string;
  status: 'initializing' | 'ready' | 'error' | 'terminated';
  url?: string;
}

// File operation types
export interface FileOperation {
  path: string;
  content?: string;
  encoding?: 'utf-8' | 'base64';
}

export interface FileListItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  lastModified: Date;
}

export interface FileCreateRequest {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}

// Terminal types
export interface TerminalCommand {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  sessionId?: string; // Add support for terminal sessions
}

export interface TerminalResponse {
  output: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

// Terminal Session types for persistence
export interface TerminalSession {
  id: string;
  containerId: string;
  userId: string;
  createdAt: Date;
  lastActive: Date;
  cwd: string;
  env: Record<string, string>;
  history: TerminalHistoryEntry[];
  status: 'active' | 'suspended' | 'terminated';
  processIds: number[];
  recording?: TerminalRecording; // Optional recording for session playback
}

export interface TerminalHistoryEntry {
  id: string;
  command: string;
  timestamp: Date;
  output: string;
  exitCode: number;
  duration: number;
  cwd: string;
}

export interface TerminalRecording {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  events: TerminalEvent[];
  metadata: {
    totalCommands: number;
    totalDuration: number;
    finalStatus: 'completed' | 'interrupted';
  };
}

export interface TerminalEvent {
  timestamp: Date;
  type: 'command' | 'output' | 'cwd_change' | 'env_change';
  data: {
    command?: string;
    output?: string;
    cwd?: string;
    env?: Record<string, string>;
    exitCode?: number;
    duration?: number;
  };
}

export interface TerminalSessionRequest {
  containerId: string;
  sessionId?: string; // If provided, resume existing session
  cwd?: string;
  env?: Record<string, string>;
}

export interface TerminalSessionResponse {
  sessionId: string;
  status: 'created' | 'resumed' | 'restored';
  cwd: string;
  env: Record<string, string>;
  history: TerminalHistoryEntry[];
}

// Git operation types
export interface GitCloneRequest {
  url: string;
  branch?: string;
  authToken?: string;
  directory?: string;
}

export interface GitCommitRequest {
  message: string;
  files?: string[];
  author?: {
    name: string;
    email: string;
  };
}

export interface GitPushRequest {
  remote?: string;
  branch?: string;
  authToken: string;
  force?: boolean;
}

export interface GitResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: string;
  timestamp?: string;
}

// Express middleware types
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    provider?: string;
  };
}

// Container-related types for API responses
export interface ContainerResponse {
  containerId: string;
  status: 'initializing' | 'ready' | 'error' | 'terminated';
  url?: string;
  message?: string;
}

// Authentication types
export interface AuthRequest {
  apiKey: string;
}

export interface AuthResponse {
  token: string;
  expires: number;
  userId: string;
}


// API Response types
export interface APIResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Error codes
export enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  AUTH_FAILED = 'AUTH_FAILED',
  CONTAINER_NOT_FOUND = 'CONTAINER_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  WEBCONTAINER_ERROR = 'WEBCONTAINER_ERROR',
  GIT_ERROR = 'GIT_ERROR',
}

// Computer Use types
export interface ComputerUseScreenshotRequest {
  containerId: string;
  element?: string;
  format?: 'png' | 'jpeg';
  quality?: number;
}

export interface ComputerUseClickRequest {
  containerId: string;
  x: number;
  y: number;
  button?: 'left' | 'right' | 'middle';
  doubleClick?: boolean;
}

export interface ComputerUseTypeRequest {
  containerId: string;
  text: string;
  element?: string;
}

// RAG types
export interface RAGSearchRequest {
  query: string;
  containerId?: string;
  repository?: string;
  fileTypes?: string[];
  maxResults?: number;
}

export interface RAGSearchResult {
  file: string;
  content: string;
  score: number;
  lineNumbers: number[];
  context: string;
}

// Worker job types
export interface WorkerJob {
  id: string;
  type: 'cleanup' | 'preWarm' | 'backup';
  data: any;
  priority: number;
  createdAt: Date;
}

// Configuration types
export interface ServerConfig {
  port: number;
  nodeEnv: string;
  allowedOrigins: string[];
  jwtSecret: string;
  webcontainerApiKey: string;
  redisUrl?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  maxContainers: number;
  containerTimeout: number;
  rateLimitMax: number;
  rateLimitWindow: number;
}

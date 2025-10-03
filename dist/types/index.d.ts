export interface ContainerSession {
    id: string;
    userId: string;
    container: any;
    createdAt: Date;
    lastActive: Date;
    repositoryUrl?: string;
    status: 'initializing' | 'ready' | 'error' | 'terminated';
    url?: string;
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
export interface TerminalCommand {
    command: string;
    cwd?: string;
    env?: Record<string, string>;
    sessionId?: string;
}
export interface TerminalResponse {
    output: string;
    exitCode: number;
    stdout: string;
    stderr: string;
    duration: number;
}
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
    recording?: TerminalRecording;
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
    sessionId?: string;
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
    data?: any;
}
export interface AuthRequest {
    apiKey: string;
}
export interface AuthResponse {
    token: string;
    expires: number;
    userId: string;
}
export interface JWTPayload {
    userId: string;
    iat: number;
    exp: number;
}
export interface APIResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
export declare enum ErrorCode {
    INVALID_REQUEST = "INVALID_REQUEST",
    AUTH_FAILED = "AUTH_FAILED",
    CONTAINER_NOT_FOUND = "CONTAINER_NOT_FOUND",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    EXECUTION_ERROR = "EXECUTION_ERROR",
    FILE_NOT_FOUND = "FILE_NOT_FOUND",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    WEBCONTAINER_ERROR = "WEBCONTAINER_ERROR",
    GIT_ERROR = "GIT_ERROR"
}
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
export interface WorkerJob {
    id: string;
    type: 'cleanup' | 'preWarm' | 'backup';
    data: any;
    priority: number;
    createdAt: Date;
}
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
//# sourceMappingURL=index.d.ts.map
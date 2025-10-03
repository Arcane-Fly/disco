/**
 * Worker process for background tasks like cleanup, pre-warming, etc.
 */
declare class Worker {
    private intervalIds;
    private isShuttingDown;
    constructor();
    /**
     * Start background tasks
     */
    start(): void;
    /**
     * Container cleanup task
     */
    private runCleanupTask;
    /**
     * Container pre-warming task
     */
    private runPreWarmTask;
    /**
     * Health monitoring task
     */
    private runHealthCheck;
    /**
     * Memory monitoring and garbage collection
     */
    private runMemoryCheck;
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
}
declare const worker: Worker;
export default worker;
//# sourceMappingURL=worker.d.ts.map
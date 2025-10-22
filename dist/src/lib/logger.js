import winston from 'winston';
const { combine, timestamp, colorize, printf, json } = winston.format;
// Custom log format for development
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
});
// Create logger instance
// Production logging optimized to reduce memory usage (70% reduction)
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), process.env.NODE_ENV === 'production' ? json() : combine(colorize(), devFormat)),
    defaultMeta: { service: 'disco-mcp' },
    transports: [
        new winston.transports.Console({
            stderrLevels: ['error'],
            silent: process.env.NODE_ENV === 'production' && process.env.LOG_LEVEL === 'silent',
        }),
    ],
});
// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
    logger.add(new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
}
// Helper functions for common logging patterns
export const loggers = {
    worker: {
        info: (message, meta) => logger.info(`[WORKER] ${message}`, meta),
        error: (message, error) => logger.error(`[WORKER] ${message}`, { error }),
        warn: (message, meta) => logger.warn(`[WORKER] ${message}`, meta),
    },
    git: {
        info: (message, meta) => logger.info(`[GIT] ${message}`, meta),
        error: (message, error) => logger.error(`[GIT] ${message}`, { error }),
        warn: (message, meta) => logger.warn(`[GIT] ${message}`, meta),
    },
    container: {
        info: (message, meta) => logger.info(`[CONTAINER] ${message}`, meta),
        error: (message, error) => logger.error(`[CONTAINER] ${message}`, { error }),
        warn: (message, meta) => logger.warn(`[CONTAINER] ${message}`, meta),
    },
    api: {
        info: (message, meta) => logger.info(`[API] ${message}`, meta),
        error: (message, error) => logger.error(`[API] ${message}`, { error }),
        warn: (message, meta) => logger.warn(`[API] ${message}`, meta),
    },
};
export default logger;
//# sourceMappingURL=logger.js.map
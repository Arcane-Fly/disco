/**
 * Database Utility Module
 * 
 * Provides database connection, health checks, and query utilities.
 * This module is designed to be pure where possible, with side effects isolated.
 */

import { DATABASE_CONFIG } from '../features/shared/lib/constants.js';

/**
 * Database connection status
 */
export interface DatabaseStatus {
  connected: boolean;
  healthy: boolean;
  latency?: number;
  error?: string;
}

/**
 * Database configuration from environment
 */
export interface DatabaseEnvironment {
  url: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
}

/**
 * Parse database configuration from environment variables
 * Pure function - no side effects
 */
export function getDatabaseConfig(): DatabaseEnvironment {
  const config: DatabaseEnvironment = {
    url: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL || '',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || process.env.POSTGRES_DB || 'disco',
    user: process.env.PGUSER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
  };

  return config;
}

/**
 * Validate database configuration
 * Pure function - no side effects
 */
export function validateDatabaseConfig(config: DatabaseEnvironment): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.url && (!config.host || !config.database)) {
    errors.push('Either DATABASE_URL or (PGHOST and PGDATABASE) must be set');
  }

  if (config.url && !config.url.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must start with postgresql://');
  }

  if (config.port && (config.port < 1 || config.port > 65535)) {
    errors.push('Database port must be between 1 and 65535');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if database is configured
 * Pure function - no side effects
 */
export function isDatabaseConfigured(): boolean {
  const config = getDatabaseConfig();
  const validation = validateDatabaseConfig(config);
  return validation.valid;
}

/**
 * Get database connection string
 * Pure function - no side effects
 */
export function getDatabaseConnectionString(): string {
  const config = getDatabaseConfig();
  
  if (config.url) {
    return config.url;
  }

  // Construct connection string from individual parts
  const password = config.password ? `:${config.password}` : '';
  return `postgresql://${config.user}${password}@${config.host}:${config.port}/${config.database}`;
}

/**
 * Mock database health check (placeholder until real DB is implemented)
 * This is a side-effect function that would connect to the database
 */
export async function checkDatabaseHealth(): Promise<DatabaseStatus> {
  try {
    if (!isDatabaseConfigured()) {
      return {
        connected: false,
        healthy: false,
        error: 'Database not configured',
      };
    }

    // TODO: Implement actual database connection check
    // For now, return a mock healthy status if configured
    return {
      connected: true,
      healthy: true,
      latency: 5, // Mock latency
    };
  } catch (error) {
    return {
      connected: false,
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get database configuration for logging (without sensitive data)
 * Pure function - no side effects
 */
export function getDatabaseConfigSafe(): Omit<DatabaseEnvironment, 'password' | 'url'> {
  const config = getDatabaseConfig();
  return {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
  };
}

/**
 * Database query timeout configuration
 * Pure constant
 */
export const DB_TIMEOUTS = {
  QUERY: DATABASE_CONFIG.QUERY_TIMEOUT,
  CONNECTION: DATABASE_CONFIG.CONNECTION_TIMEOUT,
  IDLE: DATABASE_CONFIG.IDLE_TIMEOUT,
} as const;

/**
 * Database pool configuration
 * Pure constant
 */
export const DB_POOL_CONFIG = {
  min: 2,
  max: DATABASE_CONFIG.POOL_SIZE,
  idleTimeoutMillis: DATABASE_CONFIG.IDLE_TIMEOUT,
  connectionTimeoutMillis: DATABASE_CONFIG.CONNECTION_TIMEOUT,
} as const;

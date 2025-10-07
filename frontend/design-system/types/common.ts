/**
 * Design System: Common Types
 * 
 * Shared type definitions used across the application.
 */

/**
 * Entity ID - Always use this type for entity identifiers
 */
export type EntityId = string;

/**
 * Timestamp - Unix timestamp in milliseconds
 */
export type Timestamp = number;

/**
 * ISO 8601 date string
 */
export type ISODateString = string;

/**
 * URL string
 */
export type URLString = string;

/**
 * Email address
 */
export type EmailAddress = string;

/**
 * Generic status type
 */
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

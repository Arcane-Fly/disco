import escapeHtml from 'escape-html';

/**
 * Sanitization utilities for user input
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return escapeHtml(input);
}

/**
 * Sanitize file path to prevent directory traversal
 */
export function sanitizePath(path: string): string {
  // Remove dangerous patterns
  const dangerous = ['../', '..\\', './', '.\\'];
  let sanitized = path;
  
  dangerous.forEach((pattern) => {
    sanitized = sanitized.replace(new RegExp(pattern, 'g'), '');
  });

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Normalize path separators
  sanitized = sanitized.replace(/\\/g, '/');

  return sanitized;
}

/**
 * Sanitize command for shell execution
 */
export function sanitizeCommand(command: string): string {
  // List of dangerous characters and patterns
  const dangerous = [';', '&&', '||', '|', '`', '$', '(', ')', '<', '>', '&'];
  
  // Check for dangerous patterns
  for (const char of dangerous) {
    if (command.includes(char)) {
      throw new Error(`Dangerous character detected in command: ${char}`);
    }
  }

  return command.trim();
}

/**
 * Sanitize URL to prevent SSRF attacks
 * Note: For production, consider using a dedicated library like 'is-ip' and 'ip-cidr'
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }

    // Prevent access to private IP ranges
    const hostname = parsed.hostname.toLowerCase();
    
    // Check for localhost variations
    const localhostPatterns = ['localhost', '127.', '0.0.0.0', '::1', '0:0:0:0:0:0:0:1'];
    if (localhostPatterns.some(pattern => hostname.includes(pattern))) {
      throw new Error('Access to localhost not allowed');
    }

    // Check for private IPv4 ranges (simplified check)
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
    const privateIPv4Patterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
    ];

    if (privateIPv4Patterns.some(pattern => pattern.test(hostname))) {
      throw new Error('Access to private IP range not allowed');
    }

    // Check for link-local IPv6 addresses
    if (hostname.startsWith('fe80:')) {
      throw new Error('Access to link-local IPv6 not allowed');
    }

    // TODO: For production, use proper IP parsing library to handle:
    // - IP address variations (hex, octal, integer representations)
    // - IPv6 addresses comprehensively
    // - CIDR range checking

    return parsed.toString();
  } catch (error) {
    throw new Error(`Invalid URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  const sanitized = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

/**
 * Sanitize generic string input
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  let sanitized = input.trim();
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJson<T>(input: string): T {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObjectKeys<T extends Record<string, unknown>>(obj: T): T {
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!dangerous.includes(key)) {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

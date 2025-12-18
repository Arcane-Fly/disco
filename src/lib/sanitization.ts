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
    const privateRanges = [
      'localhost',
      '127.',
      '10.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.',
      '192.168.',
      '169.254.',
    ];

    for (const range of privateRanges) {
      if (hostname.startsWith(range)) {
        throw new Error('Access to private IP range not allowed');
      }
    }

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

/**
 * Branded Types for Enhanced Type Safety
 * Implements domain-driven design patterns with compile-time type checking
 */
// Type guards and constructors with validation
export const createUserId = (value) => {
    if (!value || value.trim().length < 3) {
        throw new Error('User ID must be at least 3 characters long');
    }
    return value.trim();
};
export const createSessionId = (value) => {
    if (!value || !/^[a-zA-Z0-9-_]{10,}$/.test(value)) {
        throw new Error('Session ID must be alphanumeric with at least 10 characters');
    }
    return value;
};
export const createContainerId = (value) => {
    if (!value || !/^[a-zA-Z0-9-]{8,}$/.test(value)) {
        throw new Error('Container ID must be alphanumeric-dash with at least 8 characters');
    }
    return value;
};
export const createApiKey = (value) => {
    if (!value || value.length < 16) {
        throw new Error('API key must be at least 16 characters long');
    }
    return value;
};
export const createEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        throw new Error('Invalid email format');
    }
    return value.toLowerCase();
};
export const createTimestamp = (value = Date.now()) => {
    if (!Number.isInteger(value) || value < 0) {
        throw new Error('Timestamp must be a non-negative integer');
    }
    return value;
};
export const createNonNegativeNumber = (value) => {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error('Number must be finite and non-negative');
    }
    return value;
};
export const createPositiveNumber = (value) => {
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error('Number must be finite and positive');
    }
    return value;
};
export const createPercentage = (value) => {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new Error('Percentage must be between 0 and 100');
    }
    return value;
};
export const createFilePath = (value) => {
    if (!value || value.includes('..') || value.includes('//')) {
        throw new Error('Invalid file path');
    }
    return value;
};
export const createFileContent = (value) => {
    if (typeof value !== 'string') {
        throw new Error('File content must be a string');
    }
    return value;
};
// Type utilities for working with branded types
export const unwrap = (branded) => {
    return branded;
};
// Validation utilities
export const isValidUserId = (value) => {
    return value.trim().length >= 3;
};
export const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
export const isValidApiKey = (value) => {
    return value.length >= 16;
};
//# sourceMappingURL=branded.js.map
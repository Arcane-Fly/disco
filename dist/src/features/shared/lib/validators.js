/**
 * Validation Utilities
 * Centralized validation functions with type safety
 */
import { VALIDATION_RULES } from './constants';
/**
 * Validate a single field against a set of rules
 */
export function validateField(fieldName, value, rules) {
    const errors = [];
    // Required validation
    if (rules.required && (value == null || value === '')) {
        errors.push({
            field: fieldName,
            message: `${fieldName} is required`,
            code: 'REQUIRED',
        });
        // If required validation fails, skip other validations
        return { isValid: false, errors };
    }
    // Skip other validations if value is empty and not required
    if (value == null || value === '') {
        return { isValid: true, errors: [] };
    }
    // String length validations
    if (typeof value === 'string') {
        if (rules.min && value.length < rules.min) {
            errors.push({
                field: fieldName,
                message: `${fieldName} must be at least ${rules.min} characters`,
                code: 'TOO_SHORT',
            });
        }
        if (rules.max && value.length > rules.max) {
            errors.push({
                field: fieldName,
                message: `${fieldName} must be no more than ${rules.max} characters`,
                code: 'TOO_LONG',
            });
        }
    }
    // Number range validations
    if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
            errors.push({
                field: fieldName,
                message: `${fieldName} must be at least ${rules.min}`,
                code: 'OUT_OF_RANGE',
            });
        }
        if (rules.max !== undefined && value > rules.max) {
            errors.push({
                field: fieldName,
                message: `${fieldName} must be no more than ${rules.max}`,
                code: 'OUT_OF_RANGE',
            });
        }
    }
    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push({
            field: fieldName,
            message: `${fieldName} has invalid format`,
            code: 'INVALID_FORMAT',
        });
    }
    // Custom validation
    if (rules.custom) {
        const customResult = rules.custom(value);
        if (customResult !== true) {
            errors.push({
                field: fieldName,
                message: typeof customResult === 'string' ? customResult : `${fieldName} is invalid`,
                code: 'INVALID_FORMAT',
            });
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
/**
 * Validate multiple fields at once
 */
export function validateFields(data, schema) {
    const allErrors = [];
    for (const [fieldName, rules] of Object.entries(schema)) {
        const value = data[fieldName];
        const result = validateField(fieldName, value, rules);
        allErrors.push(...result.errors);
    }
    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
    };
}
// Specific validation functions
export function validateEmail(email) {
    return VALIDATION_RULES.EMAIL_PATTERN.test(email);
}
export function validatePassword(password) {
    return validateField('password', password, {
        required: true,
        min: VALIDATION_RULES.PASSWORD_MIN_LENGTH,
        pattern: VALIDATION_RULES.PASSWORD_PATTERN,
        custom: (pwd) => {
            if (typeof pwd !== 'string')
                return 'Password must be a string';
            const hasLower = /[a-z]/.test(pwd);
            const hasUpper = /[A-Z]/.test(pwd);
            const hasNumber = /\d/.test(pwd);
            const hasSpecial = /[@$!%*?&]/.test(pwd);
            if (!hasLower)
                return 'Password must contain at least one lowercase letter';
            if (!hasUpper)
                return 'Password must contain at least one uppercase letter';
            if (!hasNumber)
                return 'Password must contain at least one number';
            if (!hasSpecial)
                return 'Password must contain at least one special character (@$!%*?&)';
            return true;
        },
    });
}
export function validateUsername(username) {
    return validateField('username', username, {
        required: true,
        min: VALIDATION_RULES.USERNAME_MIN_LENGTH,
        max: VALIDATION_RULES.USERNAME_MAX_LENGTH,
        pattern: VALIDATION_RULES.USERNAME_PATTERN,
    });
}
export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
export function validateFilePath(path) {
    return validateField('path', path, {
        required: true,
        custom: (p) => {
            if (typeof p !== 'string')
                return 'Path must be a string';
            if (p.includes('..'))
                return 'Path cannot contain ".."';
            if (p.includes('//'))
                return 'Path cannot contain "//"';
            if (!p.startsWith('/') && !p.match(/^[a-zA-Z]:/))
                return 'Path must be absolute';
            return true;
        },
    });
}
export function validateFileSize(size, maxSize) {
    return validateField('fileSize', size, {
        required: true,
        min: 0,
        max: maxSize,
        custom: (s) => {
            if (typeof s !== 'number' || !Number.isFinite(s)) {
                return 'File size must be a valid number';
            }
            return true;
        },
    });
}
export function validateMimeType(mimeType, allowedTypes) {
    return validateField('mimeType', mimeType, {
        required: true,
        custom: (type) => {
            if (typeof type !== 'string')
                return 'MIME type must be a string';
            if (!allowedTypes.includes(type)) {
                return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
            }
            return true;
        },
    });
}
export function validatePort(port) {
    return validateField('port', port, {
        required: true,
        min: 1,
        max: 65535,
        custom: (p) => {
            if (typeof p !== 'number' || !Number.isInteger(p)) {
                return 'Port must be an integer';
            }
            return true;
        },
    });
}
export function validateIPAddress(ip) {
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return validateField('ipAddress', ip, {
        required: true,
        custom: (address) => {
            if (typeof address !== 'string')
                return 'IP address must be a string';
            if (!ipv4Pattern.test(address) && !ipv6Pattern.test(address)) {
                return 'Invalid IP address format';
            }
            return true;
        },
    });
}
export function validateContainerName(name) {
    return validateField('containerName', name, {
        required: true,
        min: 1,
        max: 63,
        pattern: /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/,
        custom: (n) => {
            if (typeof n !== 'string')
                return 'Container name must be a string';
            if (n.startsWith('-') || n.endsWith('-')) {
                return 'Container name cannot start or end with a hyphen';
            }
            if (n.startsWith('.') || n.endsWith('.')) {
                return 'Container name cannot start or end with a period';
            }
            return true;
        },
    });
}
export function validateEnvironmentVariable(name, value) {
    const nameResult = validateField('envName', name, {
        required: true,
        pattern: /^[A-Z][A-Z0-9_]*$/,
        custom: (n) => {
            if (typeof n !== 'string')
                return 'Environment variable name must be a string';
            if (n.includes('__'))
                return 'Environment variable name cannot contain consecutive underscores';
            return true;
        },
    });
    if (!nameResult.isValid) {
        return nameResult;
    }
    return validateField('envValue', value, {
        required: true,
        custom: (v) => {
            if (typeof v !== 'string')
                return 'Environment variable value must be a string';
            // Check for potentially dangerous values
            if (v.includes('\n') || v.includes('\r')) {
                return 'Environment variable value cannot contain newlines';
            }
            return true;
        },
    });
}
// Sanitization functions
export function sanitizeFilename(filename) {
    // Remove or replace dangerous characters
    return filename
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
        .replace(/^\.+/, '_')
        .substring(0, 255);
}
export function sanitizeHtml(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
export function sanitizeUrl(url) {
    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Invalid protocol');
        }
        return parsed.toString();
    }
    catch {
        return '';
    }
}
//# sourceMappingURL=validators.js.map
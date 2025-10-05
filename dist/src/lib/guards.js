/**
 * Type Guard Utilities
 * Utility functions to handle undefined values safely
 */
export const assertDefined = (val, name) => {
    if (val === undefined)
        throw new Error(`${name} is undefined`);
    return val;
};
export const isDefined = (val) => {
    return val !== undefined;
};
export const isString = (val) => {
    return typeof val === 'string';
};
export const isStringDefined = (val) => {
    return typeof val === 'string' && val.length > 0;
};
export const getStringOrDefault = (val, defaultValue = '') => {
    return val ?? defaultValue;
};
export const getNumberOrDefault = (val, defaultValue = 0) => {
    return val ?? defaultValue;
};
/**
 * Safe property access for potentially undefined objects
 */
export const safeGet = (obj, key) => {
    return obj?.[key];
};
/**
 * Ensure a value is not null or undefined
 */
export const assertExists = (val, message) => {
    if (val == null) {
        throw new Error(message || 'Value is null or undefined');
    }
    return val;
};
//# sourceMappingURL=guards.js.map
/**
 * Type Guard Utilities
 * Utility functions to handle undefined values safely
 */

export const assertDefined = <T>(val: T | undefined, name: string): T => {
  if (val === undefined) throw new Error(`${name} is undefined`);
  return val;
};

export const isDefined = <T>(val: T | undefined): val is T => {
  return val !== undefined;
};

export const isString = (val: unknown): val is string => {
  return typeof val === 'string';
};

export const isStringDefined = (val: string | undefined): val is string => {
  return typeof val === 'string' && val.length > 0;
};

export const getStringOrDefault = (val: string | undefined, defaultValue: string = ''): string => {
  return val ?? defaultValue;
};

export const getNumberOrDefault = (val: number | undefined, defaultValue: number = 0): number => {
  return val ?? defaultValue;
};

/**
 * Safe property access for potentially undefined objects
 */
export const safeGet = <T, K extends keyof T>(obj: T | undefined, key: K): T[K] | undefined => {
  return obj?.[key];
};

/**
 * Ensure a value is not null or undefined
 */
export const assertExists = <T>(val: T | null | undefined, message?: string): T => {
  if (val == null) {
    throw new Error(message || 'Value is null or undefined');
  }
  return val;
};
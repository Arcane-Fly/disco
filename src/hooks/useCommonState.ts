/**
 * Centralized State Management Hooks
 * DRY Principle: Consolidates repeated state patterns across components
 *
 * Previously scattered patterns:
 * - useState for loading/error states
 * - useEffect for data fetching
 * - Component-specific state management
 * - Repeated async operation handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// =====================================================================================
// COMMON STATE PATTERNS
// =====================================================================================

/**
 * Generic async state for loading, error, and data
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

/**
 * Hook for managing async operations with loading, error, and data states
 */
export function useAsyncState<T>(initialData: T | null = null): {
  state: AsyncState<T>;
  setLoading: (loading: boolean) => void;
  setData: (data: T) => void;
  setError: (error: string | null) => void;
  reset: () => void;
} {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setData = useCallback((data: T) => {
    setState({
      data,
      loading: false,
      error: null,
      lastUpdated: Date.now(),
    });
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error,
      lastUpdated: error ? Date.now() : prev.lastUpdated,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, [initialData]);

  return { state, setLoading, setData, setError, reset };
}

/**
 * Hook for managing async operations with automatic execution
 */
export function useAsyncOperation<T, TArgs extends any[] = []>(
  operation: (...args: TArgs) => Promise<T>,
  dependencies: any[] = []
): {
  state: AsyncState<T>;
  execute: (...args: TArgs) => Promise<void>;
  reset: () => void;
} {
  const { state, setLoading, setData, setError, reset } = useAsyncState<T>();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      try {
        const result = await operation(...args);
        if (isMountedRef.current) {
          setData(result);
        }
      } catch (error) {
        if (isMountedRef.current) {
          setError(error instanceof Error ? error.message : 'An error occurred');
        }
      }
    },
    [operation, setLoading, setData, setError]
  );

  return { state, execute, reset };
}

/**
 * Toggle state hook for boolean flags
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const set = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, set];
}

/**
 * Hook for persisting state to localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Debounced value hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

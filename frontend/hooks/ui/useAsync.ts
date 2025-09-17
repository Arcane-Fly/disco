import { useState, useEffect, useCallback } from 'react';

interface UseAsyncOptions {
  immediate?: boolean;
}

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = true } = options;
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}

export function useAsyncCallback<T extends any[], R>(
  asyncFunction: (...args: T) => Promise<R>
) {
  const [state, setState] = useState<UseAsyncState<R>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: T) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await asyncFunction(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as Error }));
      throw error;
    }
  }, [asyncFunction]);

  return { ...state, execute };
}
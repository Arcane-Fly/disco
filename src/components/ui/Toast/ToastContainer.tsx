import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from './Toast';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider component
 * Manages toast notifications state
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration: number = 5000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: ToastData = { id, type, title, message, duration };
      
      setToasts((prev) => [...prev, toast]);
    },
    []
  );

  const success = useCallback(
    (title: string, message?: string) => addToast('success', title, message),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast('error', title, message, 7000),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast('warning', title, message, 6000),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast('info', title, message),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <div
        className="fixed top-4 right-4 z-50 max-w-md w-full space-y-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast notifications
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

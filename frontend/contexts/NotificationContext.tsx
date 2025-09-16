import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { notificationSuccess, notificationWarning, notificationError } = useHapticFeedback();

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    setNotifications(prev => [...prev, newNotification]);

    // Trigger haptic feedback based on notification type
    switch (notification.type) {
      case 'success':
        notificationSuccess();
        break;
      case 'warning':
        notificationWarning();
        break;
      case 'error':
        notificationError();
        break;
      case 'info':
        // No haptic for info messages
        break;
    }

    // Auto-remove after duration if not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [notificationSuccess, notificationWarning, notificationError]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onClose }: {
  notification: Notification;
  onClose: () => void;
}) {
  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = iconMap[notification.type];

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-icon">
        <Icon className="w-5 h-5" />
      </div>
      <div className="notification-content">
        <h4 className="notification-title">{notification.title}</h4>
        <p className="notification-message">{notification.message}</p>
      </div>
      <button className="notification-close" onClick={onClose}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
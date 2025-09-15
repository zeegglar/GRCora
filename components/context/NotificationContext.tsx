import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  text: string;
  time: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (text: string, type?: Notification['type']) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', text: 'Evidence for control SOC2-CC6.1 has been approved.', time: '2h ago', type: 'success' },
    { id: '2', text: 'New risk "Delayed patch management" was added to HealthPlus project.', time: '1d ago', type: 'warning' },
    { id: '3', text: 'Reminder: Quarterly access reviews are due next week.', time: '3d ago', type: 'info' },
  ]);

  const addNotification = (text: string, type: Notification['type'] = 'info') => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      time: 'Just now',
      type,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification after 10 seconds to prevent infinite growth
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Export a global reference for use outside React components
let globalAddNotification: ((text: string, type?: Notification['type']) => void) | null = null;

export const setGlobalNotificationHandler = (handler: (text: string, type?: Notification['type']) => void) => {
  globalAddNotification = handler;
};

export const addGlobalNotification = (text: string, type?: Notification['type']) => {
  if (globalAddNotification) {
    globalAddNotification(text, type);
  }
};
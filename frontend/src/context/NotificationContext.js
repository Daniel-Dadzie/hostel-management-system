import { createContext, useContext } from 'react';

export const NotificationContext = createContext({
  isConnected: false,
  subscribe:   null,
  disconnect:  null,
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useNotifications must be used within NotificationProvider');
    return { isConnected: false, subscribe: () => () => {}, disconnect: () => {} };
  }
  return context;
};
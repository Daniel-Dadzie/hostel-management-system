import React, { createContext, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import useWebSocket from '../hooks/useWebSocket.js';

/**
 * Notification Context for managing real-time WebSocket notifications.
 * Provides access to WebSocket functionality and notification state.
 */
const NotificationContext = createContext({
  isConnected: false,
  subscribe: null,
  disconnect: null,
});

/**
 * Custom hook to access notification context.
 * Must be used within a NotificationProvider.
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn(
      'useNotifications must be used within NotificationProvider'
    );
    return {
      isConnected: false,
      subscribe: () => () => {},
      disconnect: () => {},
    };
  }
  return context;
};

/**
 * Provider component for real-time notifications via WebSocket.
 *
 * Handles:
 * - WebSocket connection lifecycle
 * - Receiving and displaying toast notifications
 * - Automatic reconnection with exponential backoff
 *
 * Usage:
 * ```jsx
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 * ```
 */
export const NotificationProvider = ({ children }) => {
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const { subscribe, disconnect, isConnected } = useWebSocket({
    url: `${
      window.location.protocol === 'https:' ? 'wss' : 'ws'
    }://${window.location.host}/ws-notifications`,
    authToken: getAuthToken(),
    onConnect: () => {
      console.log('[Notification] WebSocket connected - subscribing to notifications');
      subscribeToNotifications();
    },
    onError: (error) => {
      console.error('[Notification] WebSocket error:', error);
    },
    autoConnect: true,
  });

  /**
   * Subscribes to student-specific notifications.
   * Called after WebSocket connects.
   */
  const subscribeToNotifications = () => {
    if (subscribe) {
      // Subscribe to user-specific notification destination
      // The server will send messages to /user/{studentId}/queue/notifications
      subscribe('/user/queue/notifications', handleNotification);
    }
  };

  /**
   * Handles incoming notification messages and displays toast.
   *
   * @param {Object} message - Notification message from server
   */
  const handleNotification = (message) => {
    console.log('[Notification] Received:', message);

    const { type, title, message: messageText, severity } = message;

    // Map severity to toast type
    const toastType = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'loading',
    }[severity] || 'success';

    // Display toast notification
    toast[toastType](
      (t) => (
        <div className="flex flex-col gap-1">
          <strong className="block text-sm font-semibold">{title}</strong>
          <p className="text-sm">{messageText}</p>
        </div>
      ),
      {
        duration: severity === 'error' ? 5000 : 4000,
        position: 'top-right',
        className: `${
          severity === 'error'
            ? 'bg-red-50 text-red-900'
            : severity === 'warning'
              ? 'bg-yellow-50 text-yellow-900'
              : severity === 'success'
                ? 'bg-green-50 text-green-900'
                : 'bg-blue-50 text-blue-900'
        }`,
      }
    );

    // Optionally dispatch custom events for app-specific handling
    window.dispatchEvent(
      new CustomEvent('notification', {
        detail: { type, message, severity },
      })
    );
  };

  const value = {
    isConnected,
    subscribe,
    disconnect,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

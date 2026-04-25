import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import useWebSocket from '../hooks/useWebSocket.js';
import { NotificationContext } from './NotificationContext.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOAST_DURATION = { error: 5000, default: 4000 };

const TOAST_CLASSES = {
  error:   'bg-red-50 text-red-900',
  warning: 'bg-yellow-50 text-yellow-900',
  success: 'bg-green-50 text-green-900',
  info:    'bg-blue-50 text-blue-900',
};

const TOAST_TYPE_MAP = {
  success: 'success',
  error:   'error',
  warning: 'warning',
  info:    'loading',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAuthToken = () => localStorage.getItem('hms.token');

const getStudentIdFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const part       = token.split('.')[1];
    const normalized = part.replaceAll('-', '+').replaceAll('_', '/');
    const padded     = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded))?.sub ?? null;
  } catch {
    return null;
  }
};

const resolveWsEndpoint = () => {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  return base ? `${base}/ws-notifications` : '/ws-notifications';
};

const showNotificationToast = ({ title, message, severity }) => {
  toast[TOAST_TYPE_MAP[severity] ?? 'success'](
    () => (
      <div className="flex flex-col gap-1">
        <strong className="block text-sm font-semibold">{title}</strong>
        <p className="text-sm">{message}</p>
      </div>
    ),
    {
      duration:  severity === 'error' ? TOAST_DURATION.error : TOAST_DURATION.default,
      position:  'top-right',
      className: TOAST_CLASSES[severity] ?? TOAST_CLASSES.info,
    }
  );
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const NotificationProvider = ({ children }) => {
  // Holds the latest `subscribe` from useWebSocket without needing it as a
  // dependency of handleConnect — breaks the stale-closure double-subscription.
  const subscribeRef = useRef(null);

  const handleNotification = useCallback((msg) => {
    console.log('[Notification] Received:', msg);
    showNotificationToast({ title: msg.title, message: msg.message, severity: msg.severity });
    globalThis.dispatchEvent(
      new CustomEvent('notification', {
        detail: { type: msg.type, message: msg.message, severity: msg.severity },
      })
    );
  }, []);

  // Stable callback — reads subscribe via ref so it never goes stale and
  // doesn't cause useWebSocket's useEffect to re-run.
  
  const handleConnect = useCallback(() => {
    console.log('[Notification] WebSocket connected — subscribing to notifications.');
    subscribeRef.current?.('/user/queue/notifications', handleNotification);

    const studentId = getStudentIdFromToken();
    if (studentId) {
      subscribeRef.current?.(`/topic/students/${studentId}/notifications`, handleNotification);
    }

    // Subscribe to announcements broadcast (NEW)
    const handleAnnouncementReceived = (msg) => {
      console.log('[Announcement] Received:', msg);
      
      // Show toast notification
      showNotificationToast({
        title: msg.title || 'New Announcement',
        message: msg.body || msg.message || 'Check the announcements section for details',
        severity: 'info',
      });

      // Dispatch custom event for StudentDashboard to listen
      globalThis.dispatchEvent(
        new CustomEvent('announcement-received', {
          detail: {
            id: msg.id,
            title: msg.title,
            body: msg.body,
            publishedAt: msg.publishedAt,
            expiresAt: msg.expiresAt,
          },
        })
      );
    };

    subscribeRef.current?.('/topic/announcements', handleAnnouncementReceived);
  }, [handleNotification]);

  const handleError = useCallback((error) => {
    console.error('[Notification] WebSocket error:', error);
  }, []);

  const { subscribe, disconnect, isConnected } = useWebSocket({
    url: resolveWsEndpoint(),
    authToken: getAuthToken(),
    onConnect: handleConnect,
    onError: handleError,
    autoConnect: true,
  });

  // Always keep the ref pointing at the latest subscribe function.
  subscribeRef.current = subscribe;

  const value = useMemo(
    () => ({ isConnected, subscribe, disconnect }),
    [isConnected, subscribe, disconnect]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NotificationProvider;

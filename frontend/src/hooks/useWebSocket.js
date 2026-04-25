import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import * as StompModule from 'stompjs';

/**
 * Custom React hook for managing WebSocket connections with STOMP protocol.
 *
 * Provides:
 * - Automatic connection management (connect/disconnect)
 * - Automatic reconnection with exponential backoff
 * - Subscription management
 * - Message handling callbacks
 *
 * @param {Object}   config
 * @param {string}   config.url          - WebSocket server URL
 * @param {Function} config.onMessage    - Called when a message arrives: (message) => void
 * @param {Function} config.onError      - Called on connection error:    (error)   => void
 * @param {Function} config.onConnect    - Called on successful connect:  ()        => void
 * @param {boolean}  config.autoConnect  - Auto-connect on mount (default: true)
 * @param {string}   config.authToken    - Optional JWT for auth headers
 * @returns {Object} { subscribe, send, connect, disconnect, isConnected }
 */
export const useWebSocket = ({
  url,
  onMessage,
  onError,
  onConnect,
  autoConnect = true,
  authToken,
}) => {
  // ─── Refs ──────────────────────────────────────────────────────────────────

  const sockJsRef            = useRef(null);
  const stompRef             = useRef(null);
  const subscriptionsRef     = useRef(new Map());
  const isManuallyClosedRef  = useRef(false);
  const isMountedRef         = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const connectRef           = useRef(null);

  const MAX_ATTEMPTS  = 5;
  const BASE_DELAY_MS = 1000;
  const MAX_DELAY_MS  = 30_000;

  // ─── STOMP factory ─────────────────────────────────────────────────────────

  const resolveStompClient = useCallback((sockJsClient) => {
    const factory = StompModule?.default ?? StompModule?.Stomp ?? StompModule;
    if (typeof factory?.over === 'function')          return factory.over(sockJsClient);
    if (typeof factory?.overWebSocket === 'function') return factory.overWebSocket(sockJsClient);
    throw new Error('STOMP library unavailable — cannot resolve client factory.');
  }, []);

  // ─── Reconnect ─────────────────────────────────────────────────────────────

  const scheduleReconnect = useCallback(() => {
    if (isManuallyClosedRef.current || !isMountedRef.current) {
      console.log('[WebSocket] Skipping reconnect — closed or unmounted.');
      return;
    }

    if (reconnectAttemptsRef.current >= MAX_ATTEMPTS) {
      console.warn('[WebSocket] Max reconnection attempts reached. Giving up.');
      return;
    }

    const attempt = ++reconnectAttemptsRef.current;
    const delay   = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${attempt}/${MAX_ATTEMPTS})`);

    setTimeout(() => {
      if (!isManuallyClosedRef.current && isMountedRef.current) {
        connectRef.current?.();
      }
    }, delay);
  }, []);

  // ─── Connect ───────────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    isManuallyClosedRef.current = false;

    // Closure-scoped flag — immune to remount resetting isManuallyClosedRef.
    // Each connect() call gets its own boolean that disconnect() can flip
    // before the async SockJS error callback fires.
    let intentionallyClosed = false;

    try {
      sockJsRef.current       = new SockJS(url);
      stompRef.current        = resolveStompClient(sockJsRef.current);
      stompRef.current.debug  = null;

      // Expose setter so disconnect() can signal this specific connection.
      sockJsRef.current._intentionalClose = () => { intentionallyClosed = true; };

      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      stompRef.current.connect(
        headers,
        () => {
          console.log('[WebSocket] Connected to STOMP server.');
          reconnectAttemptsRef.current = 0;
          onConnect?.();
        },
        (error) => {
          // Guard with the closure flag — not the shared ref — so a future
          // remount resetting isManuallyClosedRef can't reopen this path.
          if (intentionallyClosed) return;
          console.error('[WebSocket] Connection error:', error);
          onError?.(error);
          scheduleReconnect();
        }
      );
    } catch (error) {
      if (intentionallyClosed) return;
      console.error('[WebSocket] Failed to create connection:', error);
      onError?.(error);
      scheduleReconnect();
    }
  }, [url, authToken, onConnect, onError, resolveStompClient, scheduleReconnect]);

  connectRef.current = connect;

  // ─── Disconnect ────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;
    // Flip the closure flag on the current SockJS instance before closing
    // so its async error callback is silenced when it fires.
    sockJsRef.current?._intentionalClose?.();

    subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
    subscriptionsRef.current.clear();

    if (stompRef.current?.connected) {
      stompRef.current.disconnect(() => {
        console.log('[WebSocket] Disconnected from STOMP server.');
      });
    }

    sockJsRef.current?.close();
  }, []);

  // ─── Subscribe ─────────────────────────────────────────────────────────────

  const subscribe = useCallback((destination, callback) => {
    if (!stompRef.current?.connected) {
      console.warn('[WebSocket] Cannot subscribe — not connected.');
      return () => {};
    }

    try {
      const subscription = stompRef.current.subscribe(destination, (message) => {
        try {
          callback(JSON.parse(message.body));
        } catch {
          callback(message.body);
        }
      });

      subscriptionsRef.current.set(destination, subscription);
      console.log(`[WebSocket] Subscribed to ${destination}`);

      return () => {
        if (subscriptionsRef.current.has(destination)) {
          subscription.unsubscribe();
          subscriptionsRef.current.delete(destination);
          console.log(`[WebSocket] Unsubscribed from ${destination}`);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Subscription error:', error);
      return () => {};
    }
  }, []);

  // ─── Send ──────────────────────────────────────────────────────────────────

  const send = useCallback((destination, body) => {
    if (!stompRef.current?.connected) {
      console.warn('[WebSocket] Cannot send — not connected.');
      return;
    }

    try {
      stompRef.current.send(destination, {}, JSON.stringify(body));
      console.log('[WebSocket] Message sent to', destination);
    } catch (error) {
      console.error('[WebSocket] Send error:', error);
    }
  }, []);

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;

    if (autoConnect) connect();

    return () => {
      isMountedRef.current = false; // must come before disconnect
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  // ─── Public API ────────────────────────────────────────────────────────────

  return {
    subscribe,
    send,
    connect,
    disconnect,
    isConnected: stompRef.current?.connected ?? false,
  };
};

export default useWebSocket;
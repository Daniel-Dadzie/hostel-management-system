import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from 'stompjs';

/**
 * Custom React hook for managing WebSocket connections with STOMP protocol.
 *
 * Provides:
 * - Automatic connection management (connect/disconnect)
 * - Automatic reconnection with exponential backoff
 * - Subscription management
 * - Message handling callbacks
 *
 * @param {Object} config - Configuration object
 * @param {string} config.url - WebSocket server URL (e.g., 'http://localhost:8080/ws-notifications')
 * @param {Function} config.onMessage - Callback when message is received: (message) => void
 * @param {Function} config.onError - Callback on connection error: (error) => void
 * @param {Function} config.onConnect - Callback on successful connection: () => void
 * @param {boolean} config.autoConnect - Whether to auto-connect on mount (default: true)
 * @param {string} config.authToken - Optional JWT token for authentication
 * @returns {Object} WebSocket state and methods
 */
export const useWebSocket = ({
  url,
  onMessage,
  onError,
  onConnect,
  autoConnect = true,
  authToken,
}) => {
  const clientRef = useRef(null);
  const stompClientRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(5);
  const reconnectDelayRef = useRef(1000); // Start with 1 second
  const subscriptionsRef = useRef(new Map());
  const isManuallyClosedRef = useRef(false);

  /**
   * Connects to the WebSocket server with STOMP protocol.
   */
  const connect = useCallback(() => {
    try {
      // Create SockJS connection
      clientRef.current = new SockJS(url);
      stompClientRef.current = Stomp.over(clientRef.current);

      // Disable console logging from Stomp library
      stompClientRef.current.debug = null;

      // Connection headers - include JWT token if provided
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      stompClientRef.current.connect(
        headers,
        () => {
          // Connection successful
          console.log('[WebSocket] Connected to STOMP server');
          reconnectAttemptsRef.current = 0;
          reconnectDelayRef.current = 1000;
          isManuallyClosedRef.current = false;

          if (onConnect) {
            onConnect();
          }
        },
        (error) => {
          // Connection error
          console.error('[WebSocket] Connection error:', error);
          if (onError) {
            onError(error);
          }
          scheduleReconnect();
        }
      );
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      if (onError) {
        onError(error);
      }
      scheduleReconnect();
    }
  }, [url, authToken, onConnect, onError]);

  /**
   * Schedules a reconnection attempt with exponential backoff.
   */
  const scheduleReconnect = useCallback(() => {
    if (isManuallyClosedRef.current) {
      console.log('[WebSocket] Manual close - skipping reconnect');
      return;
    }

    if (reconnectAttemptsRef.current >= maxReconnectAttemptsRef.current) {
      console.warn(
        '[WebSocket] Max reconnection attempts reached. Giving up.'
      );
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = Math.min(
      reconnectDelayRef.current * Math.pow(2, reconnectAttemptsRef.current - 1),
      30000
    ); // Max 30 seconds

    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttemptsRef.current})`
    );

    setTimeout(() => {
      if (!isManuallyClosedRef.current) {
        connect();
      }
    }, delay);
  }, [connect]);

  /**
   * Subscribes to a message topic/queue.
   *
   * @param {string} destination - STOMP destination (e.g., '/user/queue/notifications')
   * @param {Function} callback - Called when message received: (message) => void
   * @returns {Function} Unsubscribe function
   */
  const subscribe = useCallback(
    (destination, callback) => {
      if (
        !stompClientRef.current ||
        !stompClientRef.current.connected
      ) {
        console.warn(
          '[WebSocket] Cannot subscribe - not connected to server'
        );
        return () => {};
      }

      try {
        const subscription = stompClientRef.current.subscribe(
          destination,
          (message) => {
            try {
              const body = JSON.parse(message.body);
              callback(body);
            } catch (error) {
              console.error('[WebSocket] Error parsing message:', error);
              callback(message.body);
            }
          }
        );

        subscriptionsRef.current.set(destination, subscription);
        console.log(`[WebSocket] Subscribed to ${destination}`);

        // Return unsubscribe function
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
    },
    []
  );

  /**
   * Sends a message to a STOMP destination.
   *
   * @param {string} destination - Destination path (e.g., '/app/chat')
   * @param {Object} body - Message body as object (will be JSON stringified)
   */
  const send = useCallback((destination, body) => {
    if (
      !stompClientRef.current ||
      !stompClientRef.current.connected
    ) {
      console.warn('[WebSocket] Cannot send - not connected to server');
      return;
    }

    try {
      stompClientRef.current.send(
        destination,
        {},
        JSON.stringify(body)
      );
      console.log('[WebSocket] Message sent to', destination);
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
    }
  }, []);

  /**
   * Disconnects from WebSocket server.
   */
  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;

    // Unsubscribe from all subscriptions
    subscriptionsRef.current.forEach((subscription) => {
      subscription.unsubscribe();
    });
    subscriptionsRef.current.clear();

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.disconnect(() => {
        console.log('[WebSocket] Disconnected from STOMP server');
      });
    }

    if (clientRef.current) {
      clientRef.current.close();
    }
  }, []);

  // Auto-connect on mount and cleanup on unmount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    subscribe,
    send,
    disconnect,
    connect,
    isConnected: stompClientRef.current?.connected || false,
  };
};

export default useWebSocket;

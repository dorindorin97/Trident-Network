import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Custom hook for WebSocket connections with automatic reconnection and heartbeat
 * @param {string} url - WebSocket URL
 * @param {array} channels - Array of channels to subscribe to
 * @param {boolean} enabled - Whether to connect
 * @param {number} heartbeatInterval - Heartbeat interval in ms (default: 30000)
 * @returns {object} { data, connected, error, subscribe, unsubscribe }
 */
export function useWebSocket(url, channels = [], enabled = true, heartbeatInterval = 30000) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const subscribedChannelsRef = useRef(new Set());
  const channelsRef = useRef(channels);

  // Keep channels ref in sync without triggering reconnect
  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  // Setup heartbeat to detect dead connections
  const setupHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        } catch (err) {
          console.warn('Failed to send heartbeat:', err);
        }
      }
      setupHeartbeat(); // Reschedule
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const connect = useCallback(() => {
    if (!enabled || !url) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Resubscribe to channels using current ref
        channelsRef.current.forEach(channel => {
          try {
            ws.send(JSON.stringify({ type: 'subscribe', channel }));
            subscribedChannelsRef.current.add(channel);
          } catch (err) {
            console.warn(`Failed to subscribe to ${channel}:`, err);
          }
        });

        // Start heartbeat
        setupHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // Ignore ping/pong messages
          if (message.type !== 'pong') {
            setData(message);
          }
          // Reset heartbeat on any message
          setupHeartbeat();
        } catch (err) {
          setError('Failed to parse WebSocket message');
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;

        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }

        // Attempt reconnection if still enabled
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
        }
      };
    } catch (err) {
      setError(err.message);
    }
  }, [url, enabled, setupHeartbeat]);

  const subscribe = useCallback((channel) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
        subscribedChannelsRef.current.add(channel);
      } catch (err) {
        console.warn(`Failed to subscribe to ${channel}:`, err);
      }
    }
  }, []);

  const unsubscribe = useCallback((channel) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
        subscribedChannelsRef.current.delete(channel);
      } catch (err) {
        console.warn(`Failed to unsubscribe from ${channel}:`, err);
      }
    }
  }, []);

  // Connection management - connect when enabled, disconnect when disabled
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      // Close connection if disabled
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enabled, connect]);

  return { data, connected, error, subscribe, unsubscribe };
}

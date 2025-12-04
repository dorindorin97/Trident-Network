import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Custom hook for WebSocket connections with automatic reconnection
 * @param {string} url - WebSocket URL
 * @param {array} channels - Array of channels to subscribe to
 * @param {boolean} enabled - Whether to connect
 * @returns {object} { data, connected, error, subscribe, unsubscribe }
 */
export function useWebSocket(url, channels = [], enabled = true) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const subscribedChannelsRef = useRef(new Set());

  const connect = useCallback(() => {
    if (!enabled || !url) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Resubscribe to channels
        channels.forEach(channel => {
          ws.send(JSON.stringify({ type: 'subscribe', channel }));
          subscribedChannelsRef.current.add(channel);
        });
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setData(message);
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

        // Attempt reconnection
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
  }, [url, channels, enabled]);

  const subscribe = useCallback((channel) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
      subscribedChannelsRef.current.add(channel);
    }
  }, []);

  const unsubscribe = useCallback((channel) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
      subscribedChannelsRef.current.delete(channel);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { data, connected, error, subscribe, unsubscribe };
}

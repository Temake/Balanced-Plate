import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { nutritionQueryKeys } from '@/hooks/useNutritionAnalytics';
import type { 
  WebSocketEvent, 
  RecommendationReadyEvent, 
  AnalysisCompletedEvent, 
  AnalysisFailedEvent,
  WeeklyRecommendation 
} from '@/api/types';

// Get WebSocket URL from environment or construct from current location
const getWebSocketUrl = (): string => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.VITE_WS_HOST || window.location.host;
  return `${protocol}//${host}/ws/notifications/`;
};

export interface WebSocketState {
  isConnected: boolean;
  lastMessage: WebSocketEvent | null;
  latestRecommendation: WeeklyRecommendation | null;
  analysisCompleted: { id: number; timestamp: string } | null;
  analysisFailed: { id: number; message: string; timestamp: string } | null;
}

export interface UseWebSocketReturn extends WebSocketState {
  sendMessage: (message: object) => void;
  reconnect: () => void;
  markRecommendationRead: (recommendationId: number) => void;
  clearAnalysisNotification: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastMessage: null,
    latestRecommendation: null,
    analysisCompleted: null,
    analysisFailed: null,
  });

  // Get access token from localStorage
  const getAccessToken = useCallback((): string | null => {
    try {
      const tokens = localStorage.getItem('tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        return parsed.access || null;
      }
    } catch {
      console.error('Failed to parse tokens from localStorage');
    }
    return null;
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as WebSocketEvent;
      
      setState(prev => ({ ...prev, lastMessage: data }));

      switch (data.type) {
        case 'connection_established':
          console.log('WebSocket connection established');
          break;

        case 'recommendation_ready': {
          const recEvent = data as RecommendationReadyEvent;
          setState(prev => ({
            ...prev,
            latestRecommendation: recEvent.data.recommendation,
          }));
          // Invalidate recommendations query to refetch
          queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.weeklyRecommendations() });
          break;
        }

        case 'analysis_completed': {
          const analysisEvent = data as AnalysisCompletedEvent;
          setState(prev => ({
            ...prev,
            analysisCompleted: {
              id: analysisEvent.data.id,
              timestamp: analysisEvent.data.timestamp,
            },
          }));
          // Invalidate analytics and analyses queries to refetch
          queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.all });
          break;
        }

        case 'analysis_failed': {
          const failedEvent = data as AnalysisFailedEvent;
          setState(prev => ({
            ...prev,
            analysisFailed: {
              id: failedEvent.data.id,
              message: failedEvent.data.message,
              timestamp: failedEvent.data.timestamp,
            },
          }));
          break;
        }

        case 'pong':
          // Heartbeat response - connection is alive
          break;

        case 'error':
          console.error('WebSocket error:', data);
          break;

        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [queryClient]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user?.id) return;

    const token = getAccessToken();
    if (!token) {
      console.warn('No access token available for WebSocket connection');
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `${getWebSocketUrl()}?token=${token}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setState(prev => ({ ...prev, isConnected: true }));
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setState(prev => ({ ...prev, isConnected: false }));

        // Auto-reconnect with exponential backoff (max 30 seconds)
        if (event.code !== 4001 && reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onmessage = handleMessage;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [user?.id, getAccessToken, handleMessage]);

  // Send message
  const sendMessage = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Mark recommendation as read
  const markRecommendationRead = useCallback((recommendationId: number) => {
    sendMessage({
      type: 'mark_notification_read',
      recommendation_id: recommendationId,
    });
  }, [sendMessage]);

  // Clear analysis notification
  const clearAnalysisNotification = useCallback(() => {
    setState(prev => ({
      ...prev,
      analysisCompleted: null,
      analysisFailed: null,
    }));
  }, []);

  // Reconnect manually
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Setup connection and heartbeat
  useEffect(() => {
    connect();

    // Heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, sendMessage]);

  return {
    ...state,
    sendMessage,
    reconnect,
    markRecommendationRead,
    clearAnalysisNotification,
  };
};

export default useWebSocket;

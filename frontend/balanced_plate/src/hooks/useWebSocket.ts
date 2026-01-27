/**
 * useWebSocket hook
 * 
 * This hook provides access to the shared WebSocket connection via WebSocketContext.
 * The WebSocket connection is managed by WebSocketProvider to ensure all components
 * share the same connection and receive the same notifications.
 */

import { useWebSocketContext, type WebSocketContextValue } from '@/contexts/WebSocketContext';

export type UseWebSocketReturn = WebSocketContextValue;

export const useWebSocket = (): UseWebSocketReturn => {
  return useWebSocketContext();
};

export default useWebSocket;

import { useEffect, useRef, useState, useCallback } from 'react';
import { connectWebSocket, disconnectWebSocket } from "../../api/messageApi";

export const useWebSocket = (
  token, 
  userId, 
  groupIds, 
  onMessage, 
  onDeleteMessage, 
  onRecallMessage, 
  onPinMessage, 
  onUnpinMessage
) => {
  const isMountedRef = useRef(true);
  const [isConnected, setIsConnected] = useState(false);
  const previousGroupIdsRef = useRef([]);
  const reconnectTimeoutRef = useRef(null);
  const connectionAttemptRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  // Compare if groupIds array has changed
  const hasGroupIdsChanged = useCallback(() => {
    if (!previousGroupIdsRef.current || !groupIds) return true;
    if (previousGroupIdsRef.current.length !== groupIds.length) return true;
    return previousGroupIdsRef.current.some((id, index) => id !== groupIds[index]);
  }, [groupIds]);

  // Clean function to ensure we clear all resources
  const cleanUp = useCallback(() => {
    if (reconnectTimeoutRef.current) {  
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    disconnectWebSocket();
  }, []);

  // Setup connection function
  const setupConnection = useCallback(() => {
    if (!token || !userId || !isMountedRef.current) return Promise.resolve(false);

    // Filter out any undefined or null groupIds
    const validGroupIds = Array.isArray(groupIds) 
      ? groupIds.filter(id => id != null && id !== undefined)
      : [];
      
    console.log(`Setting up WebSocket with groupIds (attempt ${connectionAttemptRef.current + 1}):`, validGroupIds);
    
    connectionAttemptRef.current += 1;

    return connectWebSocket(
      token,
      userId,
      (receivedMessage) => {
        if (!isMountedRef.current) return;
        console.log('Received message:', receivedMessage);
        if (onMessage) onMessage(receivedMessage);
      },
      (deletedMessage) => {
        if (!isMountedRef.current) return;
        console.log('Received delete notification:', deletedMessage);
        if (onDeleteMessage) onDeleteMessage(deletedMessage);
      },
      (recalledMessage) => {
        if (!isMountedRef.current) return;
        console.log('Received recall notification:', recalledMessage);
        if (onRecallMessage) onRecallMessage(recalledMessage);
      },
      (pinnedMessage) => {
        if (!isMountedRef.current) return;
        console.log('Received pin notification:', pinnedMessage);
        if (onPinMessage) onPinMessage(pinnedMessage);
      },
      (unpinnedMessage) => {
        if (!isMountedRef.current) return;
        console.log('Received unpin notification:', unpinnedMessage);
        if (onUnpinMessage) onUnpinMessage(unpinnedMessage);
      },
      validGroupIds
    ).then(() => {
      if (!isMountedRef.current) return false;
      console.log('STOMP connected successfully');
      
      if (isMountedRef.current) {
        setIsConnected(true);
        // Reset connection attempts on success
        connectionAttemptRef.current = 0;
        // Update the previous groupIds ref
        previousGroupIdsRef.current = [...validGroupIds];
      }
      return true;
    }).catch((error) => {
      if (!isMountedRef.current) return false;
      console.error('Failed to connect STOMP:', error);
      
      if (isMountedRef.current) {
        setIsConnected(false);
        
        // Try to reconnect if we haven't exceeded max attempts
        if (connectionAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          console.log(`Attempting to reconnect in ${RECONNECT_DELAY/1000} seconds... (attempt ${connectionAttemptRef.current})`);
          // Cleanup before attempting to reconnect
          disconnectWebSocket();
          
          // Set up reconnect after delay
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) setupConnection();
          }, RECONNECT_DELAY);
        } else {
          console.error('Max reconnection attempts reached. Giving up.');
        }
      }
      return false;
    });
  }, [token, userId, groupIds, onMessage, onDeleteMessage, onRecallMessage, onPinMessage, onUnpinMessage]);

  // Main effect for handling connection
  useEffect(() => {
    isMountedRef.current = true;
    connectionAttemptRef.current = 0;
    
    // Only attempt to connect/reconnect if needed
    const shouldConnect = !isConnected || hasGroupIdsChanged();
    
    if (shouldConnect) {
      // Always clean up before setting up a new connection
      cleanUp();
      
      // Add a small delay before reconnecting to ensure previous connection is fully closed
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) setupConnection();
      }, 500);
    }

    // Cleanup function for component unmount or dependency changes
    return () => {
      isMountedRef.current = false;
      cleanUp();
    };
  }, [token, userId, groupIds, isConnected, hasGroupIdsChanged, setupConnection, cleanUp]);

  // Attempt to reconnect when connection is lost
  useEffect(() => {
    if (!isConnected && isMountedRef.current && token && userId) {
      // Don't try to reconnect immediately to avoid connection thrashing
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && connectionAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          console.log('Connection lost. Attempting to reconnect...');
          setupConnection();
        }
      }, RECONNECT_DELAY);
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isConnected, token, userId, setupConnection]);

  return { 
    isConnected,
    reconnect: useCallback(() => {
      connectionAttemptRef.current = 0;
      cleanUp();
      return setupConnection();
    }, [cleanUp, setupConnection])
  };
};

export default useWebSocket;
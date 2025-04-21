// src/utils/stompService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export const connectWebSocket = (userId, onMessageReceived) => {
  const socket = new SockJS('http://192.168.1.188:8080/ws'); 
  stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      console.log('Connected to WebSocket');

      stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
        const content = JSON.parse(message.body);
        console.log('New message:', content);
        onMessageReceived(content);
      });
    },
    onStompError: (frame) => {
      console.error('WebSocket error:', frame);
    },
  });

  stompClient.activate();
};

export const sendMessage = (message) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
    });
  } else {
    console.warn('Stomp client not connected');
  }
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    console.log('WebSocket disconnected');
  }
};

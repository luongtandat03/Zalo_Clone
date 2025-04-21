import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export const connectWebSocket = (token, onMessageReceived) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'), // backend websocket endpoint
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('Connected to WebSocket');

      // Subscribe to private queue
      stompClient.subscribe('/user/queue/messages', (message) => {
        const msg = JSON.parse(message.body);
        onMessageReceived(msg);
      });
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
    },
  });

  stompClient.activate();
};

export const sendMessageWS = (msg) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(msg),
    });
  }
};

import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (token, onMessageReceived) => {
  const socket = new SockJS("http://localhost:8080/ws");
  stompClient = Stomp.over(socket);

  stompClient.connect(
    { Authorization: `Bearer ${token}` },
    () => {
      console.log("WebSocket connected!");

      stompClient.subscribe("/user/queue/messages", (message) => {
        const msg = JSON.parse(message.body);
        onMessageReceived(msg);
      });
    },
    (error) => {
      console.error("WebSocket connection error", error);
    }
  );
};

export const sendMessage = (message) => {
  if (stompClient && stompClient.connected) {
    stompClient.send("/app/chat.send", {}, JSON.stringify(message));
  }
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log("WebSocket disconnected");
    });
  }
};

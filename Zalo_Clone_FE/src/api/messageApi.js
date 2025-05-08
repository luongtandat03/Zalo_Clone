import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE_URL = '/api/message';
const SOCKJS_URL = '/ws';

let stompClient = null;
let isDisconnecting = false;
let connectionPromise = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

// Hàm lấy lịch sử tin nhắn 1-1
export const getChatHistory = async (userId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chat-history/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const deletedMessageIds = JSON.parse(localStorage.getItem('deletedMessageIds') || '[]');
    return response.data
      .filter(msg => !deletedMessageIds.includes(msg._id || msg.id))
      .map(msg => ({
        ...msg,
        id: msg._id || msg.id,
        _id: undefined,
      }));
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

// Hàm lấy lịch sử tin nhắn nhóm
export const getGroupChatHistory = async (groupId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chat-history/group/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const deletedMessageIds = JSON.parse(localStorage.getItem('deletedMessageIds') || '[]');
    return response.data
      .filter(msg => !deletedMessageIds.includes(msg._id || msg.id))
      .map(msg => ({
        ...msg,
        id: msg._id || msg.id,
        _id: undefined,
      }));
  } catch (error) {
    console.error('Error fetching group chat history:', error);
    throw error;
  }
};

// Hàm upload file
export const uploadFile = async (files, receiverId, token, groupId = null, replyToMessageId = null) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });
    if (receiverId) formData.append('receiverId', receiverId);
    if (groupId) formData.append('groupId', groupId);
    if (replyToMessageId) formData.append('replyToMessageId', replyToMessageId);

    const response = await axios.post(`${API_BASE_URL}/upload-file`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Hàm tìm kiếm tin nhắn
export const searchMessages = async (userId, otherUserId, groupId, keyword, token) => {
  try {
    const effectiveOtherUserId = groupId ? userId : (otherUserId || userId);
    const params = new URLSearchParams({ otherUserId: effectiveOtherUserId, keyword });
    if (groupId) params.append('groupId', groupId);

    console.log('Search messages params:', params.toString());
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const deletedMessageIds = JSON.parse(localStorage.getItem('deletedMessageIds') || '[]');
    return response.data
      .filter(msg => !deletedMessageIds.includes(msg._id || msg.id))
      .map(msg => ({
        ...msg,
        id: msg._id || msg.id,
        _id: undefined,
        createAt: msg.createAt || msg.createdAt,
      }));
  } catch (error) {
    console.error('Error searching messages:', error.response?.data || error.message);
    throw error;
  }
};

// Hàm lấy danh sách tin nhắn đã ghim
export const getPinnedMessages = async (otherUserId, groupId, token) => {
  try {
    const params = new URLSearchParams();
    if (groupId) {
      params.append('otherUserId', otherUserId || '');
      params.append('groupId', groupId);
    } else {
      params.append('otherUserId', otherUserId);
    }

    console.log('Get pinned messages params:', params.toString());
    const response = await axios.get(`${API_BASE_URL}/all-pinned-messages`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const deletedMessageIds = JSON.parse(localStorage.getItem('deletedMessageIds') || '[]');
    return response.data
      .filter(msg => !deletedMessageIds.includes(msg._id || msg.id))
      .map(msg => ({
        ...msg,
        id: msg._id || msg.id,
        _id: undefined,
        createAt: msg.createAt || msg.createdAt,
      }));
  } catch (error) {
    console.error('Error fetching pinned messages:', error.response?.data || error.message);
    throw error;
  }
};

// Hàm kết nối WebSocket với STOMP
export function connectWebSocket(token, userId, onMessageCallback, onDeleteCallback, onRecallCallback, onPinCallback, onUnpinCallback, groupIds = []) {
  // Nếu đang trong quá trình ngắt kết nối, đợi một chút
  if (isDisconnecting) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        connectWebSocket(token, userId, onMessageCallback, onDeleteCallback, onRecallCallback, onPinCallback, onUnpinCallback, groupIds)
          .then(resolve)
          .catch(reject);
      }, 1000);
    });
  }

  // Nếu đã có kết nối đang chờ được thiết lập, trả về promise đó
  if (connectionPromise) {
    return connectionPromise;
  }

  // Tạo promise kết nối mới
  connectionPromise = new Promise((resolve, reject) => {
    if (!token) {
      connectionPromise = null;
      reject(new Error('Token is missing'));
      return;
    }

    // Nếu đã có kết nối hoạt động, trả về ngay
    if (stompClient && stompClient.connected) {
      console.log('STOMP connection already established and active');
      connectionPromise = null;
      resolve(stompClient);
      return;
    }

    // Nếu client chưa ở trạng thái đóng, hãy đóng nó trước
    if (stompClient && stompClient.state !== 'CLOSED') {
      console.log('STOMP client exists but not in CLOSED state, disconnecting first...');
      try {
        isDisconnecting = true;
        stompClient.deactivate();
        // Đợi một chút để đảm bảo kết nối đã đóng hoàn toàn
        setTimeout(() => {
          isDisconnecting = false;
          stompClient = null;
          // Thử kết nối lại sau khi đã đóng kết nối cũ
          connectWebSocket(token, userId, onMessageCallback, onDeleteCallback, onRecallCallback, onPinCallback, onUnpinCallback, groupIds)
            .then(resolve)
            .catch(reject);
        }, 1000);
      } catch (error) {
        console.error('Error during disconnect:', error);
        isDisconnecting = false;
        stompClient = null;
      }
      return;
    }

    console.log('Creating new STOMP client connection...');
    
    // Tạo một client STOMP mới
    stompClient = new Client({
      webSocketFactory: () => {
        console.log('Connecting to SockJS:', SOCKJS_URL);
        return new SockJS(SOCKJS_URL);
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        userId: userId,
      },
      debug: (str) => {
        console.log('STOMP debug:', str);
      },
      reconnectDelay: 10000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Xử lý sự kiện kết nối
    stompClient.onConnect = (frame) => {
      if (!stompClient) {
        console.error('STOMP client is null in onConnect');
        connectionPromise = null;
        reject(new Error('STOMP client is null'));
        return;
      }

      console.log('STOMP connected:', frame);

      try {
        // Subscription cho tin nhắn 1-1
        stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log('Raw WebSocket response:', parsedMessage);
            if (parsedMessage._id) {
              parsedMessage.id = parsedMessage._id;
              delete parsedMessage._id;
            }
            if (onMessageCallback) onMessageCallback(parsedMessage);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }, { Authorization: `Bearer ${token}` });

        // Subscription cho tin nhắn nhóm
        const validGroupIds = groupIds.filter(id => id);
        console.log('Subscribing to group topics:', validGroupIds);
        
        validGroupIds.forEach(groupId => {
          stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
            try {
              const parsedMessage = JSON.parse(message.body);
              console.log('Raw group WebSocket response:', parsedMessage);
              if (parsedMessage._id) {
                parsedMessage.id = parsedMessage._id;
                delete parsedMessage._id;
              }
              if (onMessageCallback) onMessageCallback(parsedMessage);
            } catch (error) {
              console.error('Error parsing group message:', error);
            }
          }, { Authorization: `Bearer ${token}` });
        });

        // Subscription cho thông báo xóa
        stompClient.subscribe(`/user/${userId}/queue/delete`, (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log('Delete notification:', parsedMessage);
            if (parsedMessage._id) {
              parsedMessage.id = parsedMessage._id;
              delete parsedMessage._id;
            }
            if (onDeleteCallback) onDeleteCallback(parsedMessage);
          } catch (error) {
            console.error('Error parsing delete notification:', error);
          }
        }, { Authorization: `Bearer ${token}` });

        // Subscription cho thông báo thu hồi
        stompClient.subscribe(`/user/${userId}/queue/recall`, (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log('Recall notification:', parsedMessage);
            if (parsedMessage._id) {
              parsedMessage.id = parsedMessage._id;
              delete parsedMessage._id;
            }
            if (onRecallCallback) onRecallCallback(parsedMessage);
          } catch (error) {
            console.error('Error parsing recall notification:', error);
          }
        }, { Authorization: `Bearer ${token}` });

        // Subscription cho thông báo ghim tin nhắn
        stompClient.subscribe(`/user/${userId}/queue/pin`, (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log('Pin notification:', parsedMessage);
            if (parsedMessage._id) {
              parsedMessage.id = parsedMessage._id;
              delete parsedMessage._id;
            }
            if (onPinCallback) {
              onPinCallback(parsedMessage);
            } else {
              console.warn('onPinCallback is not defined');
            }
          } catch (error) {
            console.error('Error parsing pin notification:', error);
          }
        }, { Authorization: `Bearer ${token}` });

        // Subscription cho thông báo bỏ ghim tin nhắn
        stompClient.subscribe(`/user/${userId}/queue/unpin`, (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log('Unpin notification:', parsedMessage);
            if (parsedMessage._id) {
              parsedMessage.id = parsedMessage._id;
              delete parsedMessage._id;
            }
            if (onUnpinCallback) {
              onUnpinCallback(parsedMessage);
            } else {
              console.warn('onUnpinCallback is not defined');
            }
          } catch (error) {
            console.error('Error parsing unpin notification:', error);
          }
        }, { Authorization: `Bearer ${token}` });

        connectionPromise = null;
        resolve(stompClient);
      } catch (error) {
        console.error('Error during subscription setup:', error);
        connectionPromise = null;
        reject(error);
      }
    };

    // Xử lý lỗi STOMP
    stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      connectionPromise = null;
      reject(new Error(`STOMP error: ${frame.body || frame.headers?.message || 'Unknown error'}`));
    };

    // Xử lý sự kiện đóng WebSocket
    stompClient.onWebSocketClose = (event) => {
      console.log('SockJS disconnected:', event);
      // Chỉ đặt stompClient = null nếu chúng ta không đang cố gắng ngắt kết nối chủ động
      if (!isDisconnecting) {
        stompClient = null;
      }
    };

    // Xử lý lỗi WebSocket
    stompClient.onWebSocketError = (error) => {
      console.error('SockJS error:', error);
      connectionPromise = null;
      reject(new Error(`SockJS error: ${error.message || 'Connection failed'}`));
    };

    console.log('Connecting STOMP with token:', token.substring(0, 20) + '...');
    stompClient.activate();
  });

  return connectionPromise;
}

// Hàm ngắt kết nối
export function disconnectWebSocket() {
  try {
    if (stompClient) {
      if (stompClient.connected) {
        console.log('Disconnecting active STOMP connection...');
        isDisconnecting = true;
        stompClient.deactivate().then(() => {
          console.log('STOMP disconnected successfully');
          isDisconnecting = false;
          stompClient = null;
          connectionPromise = null;
        }).catch(error => {
          console.error('Error during STOMP deactivation:', error);
          isDisconnecting = false;
          stompClient = null;
          connectionPromise = null;
        });
      } else {
        console.log('STOMP client exists but is not connected, cleaning up');
        stompClient = null;
        connectionPromise = null;
      }
    } else {
      console.log('No active STOMP client to disconnect');
    }
  } catch (error) {
    console.error('Error during disconnect:', error);
    isDisconnecting = false;
    stompClient = null;
    connectionPromise = null;
  }
}

// Hàm gửi tin nhắn chung
export function sendMessage(destination, message, token) {
  if (!stompClient) {
    console.error('Cannot send message: STOMP client is null');
    return false;
  }

  if (!stompClient.connected) {
    console.error('Cannot send message: STOMP client is not connected');
    return false;
  }

  try {
    stompClient.publish({
      destination,
      body: JSON.stringify(message),
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Sent message to', destination, ':', message);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

// Hàm thu hồi tin nhắn
export function recallMessage(identifier, userId, token) {
  if (!stompClient) {
    console.error('Cannot recall message: STOMP client is null');
    return false;
  }
  
  if (!stompClient.connected) {
    console.error('Cannot recall message: STOMP client is not connected');
    return false;
  }

  try {
    const message = { id: identifier, senderId: userId };
    stompClient.publish({
      destination: '/app/chat.recall',
      body: JSON.stringify(message),
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Recalled message:', identifier);
    return true;
  } catch (error) {
    console.error('Error recalling message:', error);
    return false;
  }
}

// Hàm xóa tin nhắn
export function deleteMessage(identifier, userId, token) {
  if (!stompClient) {
    console.error('Cannot delete message: STOMP client is null');
    return false;
  }
  
  if (!stompClient.connected) {
    console.error('Cannot delete message: STOMP client is not connected');
    return false;
  }

  try {
    const message = { id: identifier, senderId: userId };
    stompClient.publish({
      destination: '/app/chat.delete',
      body: JSON.stringify(message),
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Deleted message:', identifier);
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

// Hàm ghim tin nhắn
export function pinMessage(messageId, userId, token) {
  if (!stompClient) {
    console.error('Cannot pin message: STOMP client is null');
    return false;
  }
  
  if (!stompClient.connected) {
    console.error('Cannot pin message: STOMP client is not connected');
    return false;
  }

  try {
    stompClient.publish({
      destination: '/app/chat.pin',
      body: JSON.stringify({ id: messageId, senderId: userId }),
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Pinned message:', messageId);
    return true;
  } catch (error) {
    console.error('Error pinning message:', error);
    return false;
  }
}

// Hàm bỏ ghim tin nhắn
export function unpinMessage(messageId, userId, token) {
  if (!stompClient) {
    console.error('Cannot unpin message: STOMP client is null');
    return false;
  }
  
  if (!stompClient.connected) {
    console.error('Cannot unpin message: STOMP client is not connected');
    return false;
  }

  try {
    stompClient.publish({
      destination: '/app/chat.unpin',
      body: JSON.stringify({ id: messageId, senderId: userId }),
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Unpinned message:', messageId);
    return true;
  } catch (error) {
    console.error('Error unpinning message:', error);
    return false;
  }
}

// Hàm chuyển tiếp tin nhắn
export function forwardMessage(identifier, userId, receiverId, groupId, content, token) {
  if (!stompClient) {
    console.error('Cannot forward message: STOMP client is null');
    return false;
  }
  
  if (!stompClient.connected) {
    console.error('Cannot forward message: STOMP client is not connected');
    return false;
  }
  
  try {
    const message = {
      id: identifier,
      senderId: userId,
      receiverId,
      groupId,
      content,
      type: 'FORWARD'
    };
    stompClient.publish({
      destination: '/app/chat.forward',
      body: JSON.stringify(message),
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Forwarded message:', identifier, 'to', receiverId || groupId);
    return true;
  } catch (error) {
    console.error('Error forwarding message:', error);
    return false;
  }
}

/**
 * Đảm bảo kết nối STOMP đã được thiết lập trước khi gửi tin nhắn
 * @param {string} token - JWT token cho xác thực
 * @param {string} userId - ID của người dùng hiện tại
 * @param {array} groupIds - Mảng các ID nhóm để đăng ký
 * @returns {Promise<boolean>} - Trả về true nếu kết nối đã sẵn sàng, false nếu không thể kết nối
 */
export async function ensureStompConnection(token, userId, groupIds = []) {
  // Nếu đã có kết nối, trả về ngay
  if (stompClient && stompClient.connected) {
    console.log('STOMP connection is already active');
    return true;
  }

  // Nếu đang trong quá trình ngắt kết nối, chờ một chút
  if (isDisconnecting) {
    console.log('Waiting for disconnection to complete before connecting');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Đặt lại số lần thử kết nối
  reconnectAttempts = 0;

  // Thực hiện kết nối
  try {
    console.log('Ensuring STOMP connection...');
    
    // Trước tiên, ngắt kết nối hiện tại nếu có
    if (stompClient && !stompClient.connected) {
      try {
        console.log('Cleaning up inactive STOMP client');
        disconnectWebSocket();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error cleaning up inactive STOMP client:', error);
      }
    }

    // Thử kết nối lại vài lần nếu thất bại
    while (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      try {
        await connectWebSocket(token, userId, 
          () => {}, // onMessageCallback - empty for this connection check
          () => {}, // onDeleteCallback
          () => {}, // onRecallCallback
          () => {}, // onPinCallback
          () => {}, // onUnpinCallback
          groupIds
        );
        
        if (stompClient && stompClient.connected) {
          console.log('STOMP connection successfully ensured');
          return true;
        }
        
        reconnectAttempts++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Chờ 1 giây trước khi thử lại
      } catch (error) {
        console.error(`STOMP connection attempt ${reconnectAttempts + 1} failed:`, error);
        reconnectAttempts++;
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.error('Failed to ensure STOMP connection after multiple attempts');
    return false;
  } catch (error) {
    console.error('Error ensuring STOMP connection:', error);
    return false;
  }
}
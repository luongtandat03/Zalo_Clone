// src/screens/ChatRoomScreen.js
import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, Button, Text } from 'react-native';
import { connectWebSocket, sendMessage, disconnectWebSocket } from '../utils/stompService';
import axios from 'axios';

const ChatRoomScreen = ({ route }) => {
  const { currentUserId, receiverId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    // Fetch chat history
    axios.get(`http://192.168.1.188:8080/message/chat-history?userId=${receiverId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => setMessages(res.data)).catch(err => console.log(err));

    // WebSocket connect
    connectWebSocket(currentUserId, (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => disconnectWebSocket();
  }, []);

  const handleSend = () => {
    const msg = {
      senderId: currentUserId,
      receiverId,
      content: newMsg,
      timestamp: new Date().toISOString(),
    };
    sendMessage(msg);
    setMessages([...messages, msg]);
    setNewMsg('');
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text style={{ marginVertical: 5 }}>
            {item.senderId === currentUserId ? 'You' : 'Them'}: {item.content}
          </Text>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <TextInput
        placeholder="Nhập tin nhắn..."
        value={newMsg}
        onChangeText={setNewMsg}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Gửi" onPress={handleSend} />
    </View>
  );
};

export default ChatRoomScreen;

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ChatListScreen = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [chatData, setChatData] = useState([]);

  const loadAuthData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('accessToken');
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedToken && storedUserId) {
        setToken(storedToken);
        setUserId(storedUserId);
      } else {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại.');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu xác thực:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đăng nhập');
    }
  };

  const fetchFriends = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/friend`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Danh sách bạn bè từ API /friend:', response.data);
      const friendList = response.data.map((friend) => ({
        id: friend.id || friend.userId,
        name: friend.name || friend.fullName || friend.username || 'Người dùng không tên',
        avatar: friend.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
      }));
      setFriends(friendList);
    } catch (error) {
      console.error('Lỗi lấy danh sách bạn bè:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể tải danh sách bạn bè');
    }
  };

  const fetchLastMessage = async (friendId) => {
    if (!token || !friendId) return null;
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { friendId },
      });
      const chatHistory = response.data;
      console.log(`Lịch sử chat với bạn ${friendId}:`, chatHistory);
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        const lastMessage = chatHistory[chatHistory.length - 1];
        console.log(`Tin nhắn cuối cùng với bạn ${friendId}:`, lastMessage);
        return {
          content: lastMessage.content || 'Không có nội dung',
          createAt: lastMessage.createdAt || lastMessage.createAt || new Date().toISOString(),
          recalled: lastMessage.recalled || false,
          type: lastMessage.type || 'TEXT',
        };
      }
      return null;
    } catch (error) {
      console.error(`Lỗi lấy tin nhắn cuối cùng với bạn ${friendId}:`, error.response?.data || error.message);
      if (error.response?.status === 403) {
        console.warn(`Không có quyền truy cập lịch sử chat với bạn ${friendId}. Kiểm tra token hoặc quyền truy cập.`);
      }
      return null;
    }
  };

  const loadChatData = async () => {
    if (!friends.length) return;
    const chatList = [];
    for (const friend of friends) {
      const lastMessage = await fetchLastMessage(friend.id);
      const chatItem = {
        id: friend.id,
        avatar: friend.avatar,
        name: friend.name,
        message: lastMessage
          ? lastMessage.recalled
            ? 'Tin nhắn đã được thu hồi'
            : lastMessage.type === 'IMAGE'
            ? '[Hình ảnh]'
            : lastMessage.type === 'VIDEO'
            ? '[Video]'
            : lastMessage.type === 'FILE'
            ? '[Tệp]'
            : lastMessage.content
          : 'Chưa có tin nhắn',
        time: lastMessage ? formatTime(lastMessage.createAt) : '',
        unread: false,
      };
      chatList.push(chatItem);
    }
    console.log('Danh sách chat cuối cùng:', chatList);
    setChatData(chatList);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ`;
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    loadAuthData();
  }, []);

  useEffect(() => {
    if (token && userId) {
      fetchFriends();
    }
  }, [token, userId]);

  useEffect(() => {
    if (friends.length > 0) {
      loadChatData();
    }
  }, [friends]);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() =>
        navigation.navigate('ChatRoomScreen', {
          friendInfo: { id: item.id, name: item.name, avatar: item.avatar },
        })
      }
    >
      <Image
        source={{ uri: item.avatar }}
        style={styles.avatar}
        defaultSource={{ uri: 'https://randomuser.me/api/portraits/lego/1.jpg' }}
      />
      <View style={styles.messageInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message}>{item.message}</Text>
      </View>
      <View style={styles.timeAndUnread}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unread && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
          <Text style={styles.searchText}>Tìm kiếm</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="qr-code-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chatData}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0084ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    flex: 1,
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  addButton: {
    marginLeft: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  messageInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    color: '#666',
    fontSize: 14,
  },
  timeAndUnread: {
    alignItems: 'flex-end',
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginTop: 5,
  },
});

export default ChatListScreen;
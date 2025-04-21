import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const CHAT_DATA = [
  {
    id: '1',
    avatar: require('../assets/Cach-doi-hinh-nen-may-tinh-bang-anh-tai-ve-13.webp'),
    name: 'Thời Tiết',
    message: 'Chúc một ngày tốt lành, thời tiết...',
    time: '2 giờ',
    unread: false,
  },
  {
    id: '2',
    avatar: require('../assets/hinh-nen-desktop-32.jpg'),
    name: 'AAAA',
    message: 'TrongNhane ne ne ne ne ne',
    time: '13 giờ',
    unread: true,
  },
  
];

const renderChatItem = ({ item }) => (
  <TouchableOpacity style={styles.listItem}>
    <Image source={item.avatar} style={styles.avatar} />
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

const ChatListScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
          <Text style={styles.searchText}>Tìm kiếm</Text>
        </TouchableOpacity>
        {/* Các icon khác vẫn giữ nguyên */}
        <TouchableOpacity>
          <Ionicons name="qr-code-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList
        data={CHAT_DATA}
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
    flex: 1, // Để nút tìm kiếm chiếm phần lớn chiều ngang
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10, // Tạo khoảng cách với icon bên trái (nếu có)
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
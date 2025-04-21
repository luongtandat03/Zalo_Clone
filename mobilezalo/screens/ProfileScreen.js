import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Lỗi khi lấy username:', error);
      }
    };

    getUsername();
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
          <Text style={styles.searchText}>Tìm kiếm</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://via.placeholder.com/80/808080/FFFFFF?Text=User' }} // Thay ảnh avatar của bạn
            style={styles.avatar}
          />
          <View style={styles.userInfoText}>
          <Text style={styles.name}>{username || 'Người dùng'}</Text>

            <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
              <Text style={styles.viewProfile}>Xem trang cá nhân</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addFriendButton}>
            <Ionicons name="person-add-outline" size={24} color="#0084ff" />
          </TouchableOpacity>l
        </View>

        {/* zCloud */}
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemLeft}>
            <Ionicons name="cloud-outline" size={24} color="#0084ff" style={styles.listItemIcon} />
            <View style={styles.listItemTextContainer}>
              <Text style={styles.listItemTitle}>zCloud</Text>
              <Text style={styles.listItemSubtitle}>Không gian lưu trữ dữ liệu trên đám mây</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* zStyle */}
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemLeft}>
            <Ionicons name="brush-outline" size={24} color="#9c27b0" style={styles.listItemIcon} />
            <View style={styles.listItemTextContainer}>
              <Text style={styles.listItemTitle}>zStyle – Nổi bật trên Zalo</Text>
              <Text style={styles.listItemSubtitle}>Hình nền và nhạc cho cuộc gọi Zalo</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Cloud của tôi */}
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemLeft}>
            <Ionicons name="cloud-done-outline" size={24} color="#4caf50" style={styles.listItemIcon} />
            <View style={styles.listItemTextContainer}>
              <Text style={styles.listItemTitle}>Cloud của tôi</Text>
              <Text style={styles.listItemSubtitle}>Lưu trữ các tin nhắn quan trọng</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Dữ liệu trên máy */}
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemLeft}>
            <Ionicons name="folder-outline" size={24} color="#ff9800" style={styles.listItemIcon} />
            <View style={styles.listItemTextContainer}>
              <Text style={styles.listItemTitle}>Dữ liệu trên máy</Text>
              <Text style={styles.listItemSubtitle}>Quản lý dữ liệu Zalo của bạn</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Ví QR */}
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemLeft}>
            <Ionicons name="qr-code-outline" size={24} color="#2196f3" style={styles.listItemIcon} />
            <View style={styles.listItemTextContainer}>
              <Text style={styles.listItemTitle}>Ví QR</Text>
              <Text style={styles.listItemSubtitle}>Lưu trữ và xuất trình các mã QR quan trọng</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Tài khoản và bảo mật */}
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemLeft}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#0084ff" style={styles.listItemIcon} />
            <View style={styles.listItemTextContainer}>
              <Text style={styles.listItemTitle}>Tài khoản và bảo mật</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Quyền riêng tư */}
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemLeft}>
            <Ionicons name="lock-closed-outline" size={24} color="#777" style={styles.listItemIcon} />
            <View style={styles.listItemTextContainer}>
              <Text style={styles.listItemTitle}>Quyền riêng tư</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
  userInfo: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfoText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  viewProfile: {
    color: '#0084ff',
    fontSize: 14,
  },
  addFriendButton: {
    padding: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    marginBottom: 1,
    justifyContent: 'space-between',
  },
  listItemLeft: {
    flexDirection: 'row', // Hiển thị icon và text theo chiều ngang
    alignItems: 'center',
  },
  listItemIcon: {
    marginRight: 15, // Tạo khoảng cách giữa icon và text
  },
  listItemTextContainer: {
    flexDirection: 'column', // Hiển thị tiêu đề và mô tả theo chiều dọc
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
});

export default ProfileScreen;
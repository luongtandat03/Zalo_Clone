import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DiscoverScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
          <Text style={styles.searchText}>Tìm kiếm</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="qr-code-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Zalo Video */}
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="play-circle" size={24} color="#0084ff" style={styles.itemIcon} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Zalo Video</Text>
              <Text style={styles.itemSubtitle}>Xôn xao vật thể lạ trong lạp xường n ...</Text>
            </View>
          </View>
          <Image
            source={{ uri: 'https://via.placeholder.com/80/808080/FFFFFF?Text=Video' }} // Thay thế bằng ảnh thật nếu có
            style={styles.itemImage}
          />
          <View style={styles.unreadDot} />
        </TouchableOpacity>

        {/* Game Center */}
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="game-controller-outline" size={24} color="#64DD17" style={styles.itemIcon} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Game Center</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Dịch vụ đời sống */}
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="calendar-outline" size={24} color="#FF9800" style={styles.itemIcon} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Dịch vụ đời sống</Text>
              <Text style={styles.itemSubtitle}>Nạp điện thoại , Dò vé số , Lịch bóng đá , ...</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Tiện ích tài chính */}
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="grid-outline" size={24} color="#F44336" style={styles.itemIcon} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Tiện ích tài chính</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Dịch vụ công */}
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="business-outline" size={24} color="#2196F3" style={styles.itemIcon} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Dịch vụ công</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Mini App */}
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="layers-outline" size={24} color="#9C27B0" style={styles.itemIcon} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Mini App</Text>
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row', // Hiển thị icon và text theo chiều ngang
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 15, // Khoảng cách giữa icon và text
  },
  itemTextContainer: {
    flexDirection: 'column', // Hiển thị tiêu đề và mô tả theo chiều dọc
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 15,
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
});

export default DiscoverScreen;
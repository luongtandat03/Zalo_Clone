import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CONTACTS_DATA = [
  { id: '1', name: 'Anh Thợ Máy Lạnh', avatar: 'https://via.placeholder.com/50/00BFFF/FFFFFF?Text=AT', hasCall: true, hasVideo: true },
  { id: '2', name: 'Bé Huy', avatar: 'https://via.placeholder.com/50/FF69B4/FFFFFF?Text=BH', hasCall: true, hasVideo: false },
  // Thêm dữ liệu liên hệ khác của bạn ở đây
];

const renderContactItem = ({ item }) => (
  <View style={styles.contactItem}>
    <Image source={{ uri: item.avatar }} style={styles.avatar} />
    <Text style={styles.contactName}>{item.name}</Text>
    <View style={styles.contactActions}>
      {item.hasCall && (
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call-outline" size={24} color="#0084ff" />
        </TouchableOpacity>
      )}
      {item.hasVideo && (
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="videocam-outline" size={24} color="#0084ff" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const ContactsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
          <Text style={styles.searchText}>Tìm kiếm</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-add-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab điều hướng nhỏ */}
      <View style={styles.subTabs}>
        <TouchableOpacity style={styles.subTabItem}>
          <Text style={[styles.subTabText, styles.subTabActiveText]}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTabItem}>
          <Text style={styles.subTabText}>Nhóm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTabItem}>
          <Text style={styles.subTabText}>OA</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách liên hệ */}
      <FlatList
        data={CONTACTS_DATA}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.sectionHeader}>A</Text>}
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
  subTabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  subTabItem: {
    marginRight: 20,
  },
  subTabText: {
    color: '#333',
    fontSize: 16,
  },
  subTabActiveText: {
    fontWeight: 'bold',
    color: '#0084ff',
  },
  sectionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    color: '#777',
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  contactName: {
    flex: 1,
    fontSize: 16,
  },
  contactActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
});

export default ContactsScreen;
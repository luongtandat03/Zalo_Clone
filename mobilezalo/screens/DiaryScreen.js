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
import FontAwesome from '@expo/vector-icons/FontAwesome';

const DiaryScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
          <Text style={styles.searchText}>Tìm kiếm</Text>
        </TouchableOpacity>
        <TouchableOpacity>
         <FontAwesome name="pencil-square-o" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="white" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Status Input */}
        <View style={styles.statusInputContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40/808080/FFFFFF?Text=Me' }} // Thay ảnh avatar của bạn
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.inputButton}>
            <Text style={styles.inputText}>Hôm nay bạn thế nào ?</Text>
          </TouchableOpacity>
        </View>

        {/* Media Shortcuts */}
        <View style={styles.mediaShortcuts}>
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="image-outline" size={24} color="#00aaff" />
            <Text style={styles.mediaText}>Ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="videocam-outline" size={24} color="#ff6600" />
            <Text style={styles.mediaText}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="albums-outline" size={24} color="#cc00ff" />
            <Text style={styles.mediaText}>Album</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="timer-outline" size={24} color="#ffcc00" />
            <Text style={styles.mediaText}>Kỷ niệm</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Stories */}
        <View style={styles.recentStories}>
          <Text style={styles.sectionTitle}>Khoảnh khắc</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.storyItem}>
              <Image
                source={{ uri: 'https://via.placeholder.com/100/00aaff/FFFFFF?Text=Tao' }}
                style={styles.storyImage}
              />
              <Text style={styles.storyName}>Tao mới</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.storyItem}>
              <Image
                source={{ uri: 'https://via.placeholder.com/100/ff6600/FFFFFF?Text=Yen' }}
                style={styles.storyImage}
              />
              <Text style={styles.storyName}>Yến Nhi</Text>
            </TouchableOpacity>
            {/* Thêm các story khác */}
          </ScrollView>
        </View>

        {/* Recent Posts */}
        <View style={styles.recentPosts}>
          <View style={styles.postHeader}>
            <View style={styles.postAuthor}>
              <Image
                source={{ uri: 'https://via.placeholder.com/30/00ff00/FFFFFF?Text=HM' }}
                style={styles.postAvatar}
              />
              <View>
                <Text style={styles.postName}>Hoa Mặt Trời Xanh</Text>
                <Text style={styles.postTime}>Hôm qua lúc 16:22</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <Text style={styles.postText}>Nàng thơ bên gốc mít nhà Ông Bà cố ...</Text>
          <Image
            source={{ uri: 'https://via.placeholder.com/350/808080/FFFFFF?Text=PostImage' }}
            style={styles.postImage}
          />
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postAction}>
              <Ionicons name="heart-outline" size={24} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction}>
              <Ionicons name="chatbubble-outline" size={24} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction}>
              <Ionicons name="share-outline" size={24} color="#888" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thêm các bài post khác */}
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
  notificationButton: {
    marginLeft: 10,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  inputButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  inputText: {
    color: '#777',
  },
  mediaShortcuts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 15,
    marginBottom: 10,
  },
  mediaButton: {
    alignItems: 'center',
  },
  mediaText: {
    marginTop: 5,
    color: '#555',
    fontSize: 12,
  },
  recentStories: {
    backgroundColor: 'white',
    paddingVertical: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    paddingHorizontal: 15,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  storyItem: {
    marginLeft: 15,
    alignItems: 'center',
  },
  storyImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  storyName: {
    fontSize: 12,
    color: '#555',
  },
  recentPosts: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  postName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#777',
  },
  postText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  postAction: {
    padding: 5,
  },
});

export default DiaryScreen;
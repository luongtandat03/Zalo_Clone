// ContactsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Đảm bảo đã cài đặt @expo/vector-icons hoặc react-native-vector-icons
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

// --- Placeholders ---
const getAuthToken = async () => {
    // console.log("Gọi hàm getAuthToken..."); // Bỏ log nếu không cần thiết
    try {
        const token = await AsyncStorage.getItem('accessToken');
        // console.log("Token lấy được:", token ? "Có token" : "Không có token");
        return token;
    } catch (e) {
        console.error('Lỗi khi lấy token từ AsyncStorage:', e);
        return null;
    }
};
// --- End Placeholders ---


// *** HÀM RENDER ITEM CHO DANH SÁCH BẠN BÈ ***
// Sử dụng tên trường 'id' và 'name' dựa trên log bạn cung cấp
const renderFriendItem = ({ item, navigation }) => {
    // console.log("RenderFriendItem:", JSON.stringify(item)); // Bỏ log nếu không cần thiết

    const friendId = item.id;      // Dùng item.id từ log
    const friendName = item.name;    // Dùng item.name từ log
    const avatar = item.avatar;   // Dùng item.avatar từ log

    if (!friendId || !friendName) {
        console.warn("renderFriendItem: Bỏ qua item bạn bè thiếu id hoặc name:", JSON.stringify(item));
        return null; // An toàn hơn là không render item lỗi
    }

    // Hàm xử lý khi nhấn vào bạn bè
    const handlePressFriend = () => {
        console.log(`Chuyển sang màn hình chat với: ${friendName} (ID: ${friendId})`);
        // Đảm bảo 'friendInfo' chứa đủ thông tin cần thiết cho ChatRoomScreen (ít nhất là id, name, avatar)
        navigation.navigate('ChatRoomScreen', {
             friendInfo: item
        });
    };

    return (
        <TouchableOpacity style={styles.contactItem} onPress={handlePressFriend}>
            <Image
                source={{ uri: avatar || 'https://via.placeholder.com/45' }} // Ảnh mặc định
                style={styles.avatar}
            />
            <Text style={styles.contactName}>{friendName}</Text>
            {/* Icon mũi tên chỉ hướng sang phải */}
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>
    );
};


const ContactsScreen = ({ navigation }) => {
  console.log("Component ContactsScreen Rendered/Re-rendered");

  // --- States ---
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [receiverIdInput, setReceiverIdInput] = useState('');
  const [isLoadingSendRequest, setIsLoadingSendRequest] = useState(false); // Đổi tên cho rõ ràng
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [friends, setFriends] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  // --- End States ---


  // --- Logic Fetch Lời Mời ---
  const fetchPendingCount = useCallback(async () => {
    console.log("ContactsScreen: fetchPendingCount running...");
    try {
      const token = await getAuthToken(); if (!token) return;
      const url = `${API_BASE_URL}/friend/requests/pending`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      const count = (response.data && Array.isArray(response.data)) ? response.data.length : 0;
      setPendingRequestCount(count);
    } catch (error) { console.error("fetchPendingCount Error:", error); setPendingRequestCount(0); }
  }, []); // Dependency rỗng vì getAuthToken không nên thay đổi thường xuyên

  useEffect(() => {
    // Listener để fetch lại khi màn hình được focus (quay lại từ màn hình khác)
    const unsubscribe = navigation.addListener('focus', fetchPendingCount);
    return unsubscribe; // Cleanup listener khi unmount
  }, [navigation, fetchPendingCount]);
  // --- Kết thúc Logic Fetch Lời Mời ---


  // --- Logic Fetch Bạn Bè ---
  const fetchFriends = useCallback(async () => {
      console.log("ContactsScreen: fetchFriends running...");
      setIsLoadingFriends(true);
      try {
          const token = await getAuthToken();
          if (!token) { Alert.alert('Lỗi', 'Không tìm thấy token.'); throw new Error("Token not found"); }
          const url = `${API_BASE_URL}/friend`;
          const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
          console.log("ContactsScreen: Dữ liệu bạn bè nhận được:", JSON.stringify(response.data, null, 2));
          if (Array.isArray(response.data)) {
              setFriends(response.data);
          } else { console.warn("API /friend không trả về mảng:", response.data); setFriends([]); }
      } catch (error) { console.error("Lỗi khi lấy danh sách bạn bè:", error); setFriends([]); }
      finally { setIsLoadingFriends(false); }
  }, []); // Dependency rỗng

  useEffect(() => {
      // Listener để fetch lại khi màn hình được focus
      const unsubscribe = navigation.addListener('focus', fetchFriends);
      return unsubscribe;
  }, [navigation, fetchFriends]);
  // --- Kết thúc Logic Fetch Bạn Bè ---

  // Fetch dữ liệu lần đầu khi component được mount
  useEffect(() => {
      console.log("ContactsScreen: Component did mount, fetching initial data...");
      fetchPendingCount();
      fetchFriends();
  }, [fetchPendingCount, fetchFriends]); // Gọi 1 lần khi mount dựa vào useCallback


  // --- Hàm Gửi Lời Mời ---
  const handleSendFriendRequest = async () => {
      console.log("handleSendFriendRequest: Bắt đầu gửi lời mời đến ID:", receiverIdInput);
      if (!receiverIdInput.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập ID người dùng.'); return; }
      Keyboard.dismiss(); setIsLoadingSendRequest(true); // Dùng state loading riêng
      try {
          const token = await getAuthToken(); if (!token) { Alert.alert('Lỗi', 'Không tìm thấy token.'); throw new Error("Token not found");}
          const url = `${API_BASE_URL}/friend/send-request/${receiverIdInput.trim()}`;
          await axios.post(url, null, { headers: { Authorization: `Bearer ${token}` } });
          Alert.alert('Thành công', 'Đã gửi lời mời kết bạn!');
          setReceiverIdInput(''); setIsSearchActive(false);
      } catch (error) {
          console.error('handleSendFriendRequest Error:', error.response?.data || error.message);
          let errorMessage = 'Lỗi khi gửi lời mời.';
          if (error.response?.status === 404) errorMessage = 'Không tìm thấy người dùng.';
          else if (error.response?.status === 401 || error.response?.status === 403) errorMessage = 'Lỗi xác thực.';
          else if (error.response?.data?.message) errorMessage = error.response.data.message;
          else if (!error.response) errorMessage = 'Không thể kết nối máy chủ.';
          Alert.alert('Lỗi', errorMessage);
      } finally { setIsLoadingSendRequest(false); }
  };
  // --- Kết thúc hàm gửi lời mời ---


  // --- Render Header Động ---
  const renderHeader = () => {
    // console.log("renderHeader: isSearchActive =", isSearchActive);
    if (isSearchActive) {
      return (
        <View style={[styles.header, styles.searchHeader]}>
          <TouchableOpacity onPress={() => { setIsSearchActive(false); setReceiverIdInput(''); }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput} placeholder="Nhập ID người dùng..." placeholderTextColor="#ccc"
            value={receiverIdInput} onChangeText={setReceiverIdInput} autoFocus={true}
            onSubmitEditing={handleSendFriendRequest} selectionColor={'white'} autoCapitalize="none"
          />
          {/* Sử dụng isLoadingSendRequest */}
          {isLoadingSendRequest ? ( <ActivityIndicator color="white" style={styles.sendButton} /> )
           : ( <TouchableOpacity
                style={styles.sendButton} onPress={handleSendFriendRequest}
                disabled={!receiverIdInput.trim()} >
                <Ionicons name="send" size={24} color={!receiverIdInput.trim() ? "#aaa" : "white"} />
             </TouchableOpacity> )}
        </View>
      );
    } else {
      return (
        <View style={styles.header}>
          <TouchableOpacity style={styles.searchButton} onPress={() => setIsSearchActive(true)}>
            <Ionicons name="search" size={20} color="white" style={styles.searchIcon}/>
            <Text style={styles.searchText}>Tìm kiếm bạn bè theo ID</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };
  // --- Kết thúc Render Header ---


  // console.log("ContactsScreen: Chuẩn bị render JSX chính");
  return (
    <View style={styles.container}>
        <SafeAreaView style={styles.headerContainer}>
            {renderHeader()}
        </SafeAreaView>

        {/* Tab điều hướng nhỏ */}
        <View style={styles.subTabs}>
             <TouchableOpacity style={styles.subTabItem}><Text style={[styles.subTabText, styles.subTabActiveText]}>Bạn bè</Text></TouchableOpacity>
             <TouchableOpacity style={styles.subTabItem}><Text style={styles.subTabText}>Nhóm</Text></TouchableOpacity>
             <TouchableOpacity style={styles.subTabItem}><Text style={styles.subTabText}>OA</Text></TouchableOpacity>
        </View>

        {/* Mục Lời mời kết bạn */}
        <TouchableOpacity
            style={styles.friendRequestButton}
            onPress={() => { console.log("Nhấn vào Lời mời kết bạn"); navigation.navigate('FriendRequestsScreen');}}
        >
            <View style={styles.friendRequestIconContainer}><Ionicons name="people-outline" size={22} color="white"/></View>
            <Text style={styles.friendRequestText}>Lời mời kết bạn {pendingRequestCount > 0 ? `(${pendingRequestCount})` : ''}</Text>
        </TouchableOpacity>

        {/* --- DANH SÁCH BẠN BÈ --- */}
        {/* console.log("ContactsScreen: isLoadingFriends =", isLoadingFriends, "Số lượng bạn bè =", friends.length)} */}
        {isLoadingFriends ? (
            <ActivityIndicator size="large" color="#0084ff" style={styles.listLoader} />
        ) : (
            <FlatList
                style={styles.friendList}
                data={friends}
                renderItem={({ item }) => renderFriendItem({ item, navigation })} // Truyền navigation
                keyExtractor={(item, index) => item?.id?.toString() || `friend-${index}`} // Dùng id từ log
                ListEmptyComponent={<Text style={styles.emptyListText}>Chưa có bạn bè nào.</Text>}
                // extraData={friends} // Thường không cần thiết nếu data thay đổi đúng cách
            />
        )}
        {/* --- Kết thúc Danh sách bạn bè --- */}
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerContainer: { backgroundColor: '#0084ff' },
    header: { backgroundColor: '#0084ff', height: 55, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
    searchHeader: { justifyContent: 'space-between' },
    searchButton: { flex: 1, height: 36, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 5, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
    searchIcon: { marginRight: 8 },
    searchText: { color: '#f0f0f0', fontSize: 15 },
    searchInput: { flex: 1, height: '100%', color: 'white', fontSize: 16, marginLeft: 10, marginRight: 5 },
    sendButton: { padding: 5, justifyContent: 'center', alignItems: 'center' },
    subTabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    subTabItem: { marginRight: 25 },
    subTabText: { color: '#666', fontSize: 16 },
    subTabActiveText: { fontWeight: 'bold', color: '#000' },
    friendRequestButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    friendRequestIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#0084ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    friendRequestText: { flex: 1, fontSize: 17, color: '#111' },
    listLoader: { marginTop: 30, flex: 1 }, // Cho loading indicator chiếm không gian nếu list rỗng
    friendList: { flex: 1 }, // Quan trọng: Để FlatList chiếm phần không gian còn lại
    contactItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 15, backgroundColor: '#eee' },
    contactName: { flex: 1, fontSize: 17, color: '#111' },
    emptyListText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
});

export default ContactsScreen;
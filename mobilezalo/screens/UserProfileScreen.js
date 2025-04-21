import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const token = await AsyncStorage.getItem('accessToken');

        if (!storedUsername || !token) {
          setErrorMessage("Không tìm thấy thông tin đăng nhập.");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://192.168.1.188:8080/user/get-info-for-user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Gửi token để API xác thực
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setErrorMessage(`Lỗi API: ${response.status} - ${response.statusText}`);
          setLoading(false);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setErrorMessage("API không trả về JSON, kiểm tra lại endpoint.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Dữ liệu từ API:', data);
        setUserData(data);
      } catch (error) {
        setErrorMessage("Lỗi khi lấy dữ liệu: " + error.message);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0084ff" />
      ) : errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : (
        <View style={styles.profileContainer}>
          <Text style={styles.username}>{userData?.username || 'Không tìm thấy người dùng'}</Text>
          <Text style={styles.email}>{userData?.email || 'Email không có'}</Text>
          <Text style={styles.createdAt}>
            Ngày tạo: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Không có dữ liệu'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileContainer: {
    padding: 20,
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 18,
    color: '#555',
    marginTop: 5,
  },
  createdAt: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default UserProfileScreen;
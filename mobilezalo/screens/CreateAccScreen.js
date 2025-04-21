import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView, // Để xử lý bàn phím
  Platform, // Import Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RegistrationDetailScreen from './RegistrationDetailScreen';


const CreateAccScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhập số điện thoại</Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Phone Number Input */}
        <View style={styles.phoneInputContainer}>
          <TextInput
            style={styles.phoneInput}
            placeholder="Nhập số điện thoại" // Thay đổi placeholder
            keyboardType="phone-pad"
            underlineColorAndroid="transparent" // Loại bỏ viền mặc định trên Android
          />
        </View>

        {/* Terms Checkboxes */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity style={styles.checkbox}>
            {/* Checkbox component (có thể sử dụng thư viện hoặc tự tạo) */}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            Tôi đồng ý với các <Text style={styles.linkText}>điều khoản sử dụng Zalo</Text>
          </Text>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity style={styles.checkbox}>
            {/* Checkbox component (có thể sử dụng thư viện hoặc tự tạo) */}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            Tôi đồng ý với điều khoản <Text style={styles.linkText}>Mạng xã hội của Zalo</Text>
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('RegistrationDetail')}>
    <Text style={styles.continueButtonText}>Tiếp tục</Text>
  </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Bạn đã có tài khoản? <Text style={styles.linkText}>Đăng nhập ngay</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  phoneInputContainer: {
    marginBottom: 15,
    borderWidth: 1, // Thêm viền
    borderColor: '#ccc',  // Màu viền nhạt
    borderRadius: 5,     // Bo góc
    paddingHorizontal: 10, // Thêm padding ngang cho đẹp
  },
  phoneInput: {
    height: 40,
    outlineStyle: 'none',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    color: '#0084ff',
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: 'lightblue',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#333',
  },
});

export default CreateAccScreen;
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { requestPasswordReset } from '../api/authApi'; 

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleSendCode = async () => {
    if (!email) return Alert.alert("Lỗi", "Vui lòng nhập email");
  
    try {
      await requestPasswordReset(email);
      Alert.alert("Thành công", "Mã xác nhận đã được gửi về email");
      navigation.navigate("ResetPassword", { email }); 
    } catch (error) {
      Alert.alert("Thất bại", error); // Log lỗi chính xác
    }
  };
  

  return (
    <View style={{ padding: 20 }}>
      <Text>Nhập Email của bạn:</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: '#ccc', marginVertical: 10, padding: 10 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Gửi mã xác nhận" onPress={handleSendCode} />
    </View>
  );
};

export default ForgotPasswordScreen;

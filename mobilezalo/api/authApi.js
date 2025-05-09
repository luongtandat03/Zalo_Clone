import { API_BASE_URL } from "../config";
import axios from 'axios';

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Register failed");
  return data;
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send reset link");
    }

    return data; // { message: "..."} nếu thành công
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

export const resetPassword = async (code, password) => {
  try {
    const body = JSON.stringify({ code, password });
    console.log("Reset password request body:", body); // Log để kiểm tra body
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Invalid or expired reset code");
    }

    return data; // { message: "Password reset successfully" }
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const body = JSON.stringify({ email });
    console.log("Request password reset body:", body); // Log để kiểm tra body
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    console.log('Lỗi gửi yêu cầu reset:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Gửi yêu cầu đặt mật khẩu thất bại';
  }
};
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Lấy thông tin hồ sơ người dùng
export const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/get-info-for-user`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch profile");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};


export const updateUserProfile = async (data) => {
  try {
    const formData = new FormData();

    // Tạo JSON cho 'request'
    const requestData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      birthday: data.birthday,
    };

    formData.append("request", new Blob([JSON.stringify(requestData)], { type: "application/json" }));

    if (data.avatar) {
      formData.append("avatar", data.avatar); 
    }

    const response = await axios.put("/api/user/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
      },
    });

    return response.data;
  } catch (error) {
    console.error("Update profile failed", error);
    return null;
  }
};

// Đổi mật khẩu
export const updatePassword = async (oldPassword, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update password");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating password:", error);
    return null;
  }
};
// 1. Lấy danh sách bạn bè hiện tại
export const fetchFriendsList = async () => {
  try {
    const response = await fetch(`/api/friend`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch friends list");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching friends list:", error);
    return null;
  }
};

// 2. Lấy danh sách lời mời kết bạn đang chờ xử lý
export const fetchPendingFriendRequests = async () => {
  try {
    const response = await fetch(`/api/friend/requests/pending`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch pending friend requests");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    return null;
  }
};

// 3. Gửi lời mời kết bạn tới một người dùng
export const sendFriendRequest = async (userId) => {
  try {
    const response = await fetch(`/api/friend/send-request/${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send friend request");
    }
    return response.json();
  } catch (error) {
    console.error("Error sending friend request:", error);
    return null;
  }
};

// 4. Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (userId) => {
  try {
    const response = await fetch(`/api/friend/request/${userId}/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to accept friend request");
    }
    return response.json();
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return null;
  }
};
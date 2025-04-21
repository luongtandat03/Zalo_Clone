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

// Cập nhật hồ sơ người dùng
export const updateUserProfile = async (updatedData) => {
  try {
    const formData = new FormData();
    for (const key in updatedData) {
      if (key === "avatar" && updatedData[key] instanceof File) {
        formData.append("profileImage", updatedData[key]);
      } else {
        formData.append(key, updatedData[key]);
      }
    }

    const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
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

// Tải ảnh đại diện
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await fetch(`${API_BASE_URL}/user/upload-avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Upload failed");
    }
    return response.json();
  } catch (error) {
    console.error("Upload error:", error);
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
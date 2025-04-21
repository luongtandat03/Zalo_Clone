import { API_BASE_URL } from "../config";
import { getAccessToken } from "../utils/storage";

export const fetchUserProfile = async () => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_BASE_URL}/user/get-info-for-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
export const updateUserProfile = async (updatedData) => {
    try {
      const token = await getAccessToken();
      const formData = new FormData();
  
      for (const key in updatedData) {
        if (key === "avatar" && updatedData[key]?.uri) {
          const file = {
            uri: updatedData[key].uri,
            name: updatedData[key].fileName || "avatar.jpg",
            type: updatedData[key].type || "image/jpeg",
          };
          formData.append("profileImage", file);
        } else {
          formData.append(key, updatedData[key]);
        }
      }
  
      const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  };

  export const updatePassword = async (oldPassword, newPassword) => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error updating password:", error);
      return null;
    }
  };

  export const uploadAvatar = async (file) => {
    try {
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append("profileImage", {
        uri: file.uri,
        type: file.type || "image/jpeg",
        name: file.fileName || "avatar.jpg",
      });
  
      const response = await fetch(`${API_BASE_URL}/user/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Upload failed");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };
  

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
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
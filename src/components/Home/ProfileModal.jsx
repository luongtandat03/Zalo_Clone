import React, { useState } from "react";
import { Modal, Paper, Box, Avatar, Typography, Divider, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import UpdateProfileForm from "./UpdateProfileForm";
import { updateUserProfile } from "../../api/user";

const ProfileModalStyled = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ProfileContent = styled(Paper)(({ theme }) => ({
  position: "relative",
  width: 400,
  overflowY: "auto",
  maxHeight: "90vh",
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  padding: theme.spacing(4),
  outline: "none",
}));

const ProfileModal = ({ open, onClose, profileData, userProfile, setUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const handleProfileUpdate = async (event, formData) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      // Lấy file avatar từ input
      const avatarFile = document.getElementById("profile-image-upload")?.files[0];
  
      // Kiểm tra nếu avatarFile không tồn tại, bạn có thể xử lý mặc định nếu cần
      if (!avatarFile) {
        console.warn("No avatar file selected");
      }
  
      // Cập nhật hồ sơ người dùng
      const updatedProfile = {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        gender: formData.get("gender"),
        birthday: formData.get("birthday"),
        avatar: avatarFile,
      };
  
      // Gửi yêu cầu cập nhật hồ sơ
      const result = await updateUserProfile(updatedProfile);
  
      // Nếu cập nhật thành công, cập nhật lại dữ liệu người dùng
      if (result) {
        setUserProfile(result);
        setIsEditing(false);
        setSnackbar({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
        onClose();
      }
    } catch (error) {
      console.error("Update profile failed:", error);
      setSnackbar({ open: true, message: "Có lỗi xảy ra khi cập nhật hồ sơ.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };
  

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const updatedProfile = {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          phone: userProfile.phone,
          gender: userProfile.gender,
          birthday: userProfile.birthday,
          avatar: file,
        };
        const result = await updateUserProfile(updatedProfile);
        if (result) {
          setUserProfile(result);
          setSnackbar({ open: true, message: "Cập nhật ảnh đại diện thành công!", severity: "success" });
        }
      } catch (error) {
        console.error("Avatar upload failed:", error);
        setSnackbar({ open: true, message: "Có lỗi khi tải ảnh đại diện.", severity: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderProfileContent = () => {
    const data = userProfile || profileData;
    if (!data) return null;

    return (
      <Box textAlign="center">
        <label htmlFor="profile-image-upload">
          <Box position="relative" display="inline-block">
            <Avatar
              src={data.avatar}
              sx={{
                width: 120,
                height: 120,
                margin: "0 auto 20px",
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
            />
            {loading && (
              <CircularProgress
                size={48}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-24px",
                  marginLeft: "-24px",
                }}
              />
            )}
          </Box>
        </label>

        <input
          type="file"
          id="profile-image-upload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />

        <Typography variant="h5" gutterBottom>
          {data.username || data.name}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Status: {data.status || "Unknown"}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" gutterBottom>
          <strong>User ID:</strong> {data.id || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Email:</strong> {data.email || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Full Name:</strong> {`${data.firstName || ""} ${data.lastName || ""}`.trim() || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Date of Birth:</strong> {data.birthday || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Gender:</strong> {data.gender || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Phone:</strong> {data.phone || "N/A"}
        </Typography>

        {userProfile && (
          <Box>
            {isEditing ? (
              <UpdateProfileForm
                profileData={data}
                onSubmit={handleProfileUpdate}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => setIsEditing(true)}
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Edit Profile"}
              </Button>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <ProfileModalStyled open={open} onClose={onClose} aria-labelledby="profile-modal">
        <ProfileContent>{renderProfileContent()}</ProfileContent>
      </ProfileModalStyled>

      {/* Snackbar hiển thị thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProfileModal;

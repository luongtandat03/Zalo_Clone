import React, { useState } from "react";
import { Modal, Paper, Box, Avatar, Typography, Divider, Button } from "@mui/material";
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
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  padding: theme.spacing(4),
  outline: "none",
}));

const ProfileModal = ({ open, onClose, profileData, userProfile, setUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleProfileUpdate = async (event, formData) => {
    event.preventDefault();
    const avatarFile = document.getElementById("profile-image-upload")?.files[0];

    const updatedProfile = {
      dateOfBirth: formData.get("dateOfBirth"),
      gender: formData.get("gender"),
      avatar: avatarFile,
    };

    const result = await updateUserProfile(updatedProfile);
    if (result) {
      setUserProfile(result);
      setIsEditing(false);
      onClose();
    }
  };

  const renderProfileContent = () => {
    const data = userProfile || profileData;
    if (!data) return null;

    return (
      <Box textAlign="center">
        <label htmlFor="profile-image-upload">
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
        </label>
        <input
          type="file"
          id="profile-image-upload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const updatedProfile = { ...userProfile, avatar: file };
              updateUserProfile(updatedProfile).then((result) => {
                if (result) setUserProfile(result);
              });
            }
          }}
        />
        <Typography variant="h5" gutterBottom>
          {data.username || data.name}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Status: {data.status}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" gutterBottom>
          User ID: {data.id}
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
              <Box>
                <Typography variant="body1" gutterBottom>
                  Date of Birth: {data.dateOfBirth}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Gender: {data.gender}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setIsEditing(true)}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <ProfileModalStyled open={open} onClose={onClose} aria-labelledby="profile-modal">
      <ProfileContent>{renderProfileContent()}</ProfileContent>
    </ProfileModalStyled>
  );
};

export default ProfileModal;
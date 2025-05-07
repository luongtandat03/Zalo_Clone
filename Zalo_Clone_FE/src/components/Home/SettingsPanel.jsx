import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { updatePassword } from "../../api/user";

const SettingsPanel = () => {
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleUpdatePassword = async () => {
    const oldPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const isMaxLength = newPassword.length <= 10;

    if (!hasUpperCase || !isMaxLength) {
      alert("Mật khẩu phải có ít nhất 1 ký tự in hoa và tối đa 10 ký tự");
      return;
    }

    const result = await updatePassword(oldPassword, newPassword);
    if (result) {
      alert("Password updated successfully");
      setShowPasswordFields(false);
    } else {
      alert("Failed to update password");
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Account Settings
      </Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => setShowPasswordFields(!showPasswordFields)}
        sx={{ mb: 2 }}
      >
        Change Password
      </Button>
      {showPasswordFields && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%" }}>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            margin="normal"
            name="currentPassword"
            id="currentPassword"
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            margin="normal"
            name="newPassword"
            id="newPassword"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            margin="normal"
            name="confirmPassword"
            id="confirmPassword"
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, minWidth: 200 }}
            onClick={handleUpdatePassword}
          >
            Update Password
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SettingsPanel;
import React, { useState } from "react";
import { Box, Typography, Button, TextField, Modal, Paper, IconButton, Divider, Alert } from "@mui/material";
import { updatePassword, resetPassword } from "../../api/user";
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';

const SettingsPanel = () => {
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isForgetPassword, setIsForgetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleOpenPasswordModal = () => {
    setOpenPasswordModal(true);
    setIsForgetPassword(false);
  };
  
  const handleClosePasswordModal = () => {
    setOpenPasswordModal(false);
    setPasswordError("");
    setPasswordSuccess("");
    setIsForgetPassword(false);
    setResetEmail("");
  };

  const handleUpdatePassword = async () => {
    const oldPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Reset error/success messages
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const isMaxLength = newPassword.length <= 10;

    if (!hasUpperCase || !isMaxLength) {
      setPasswordError("Mật khẩu phải có ít nhất 1 ký tự in hoa và tối đa 10 ký tự");
      return;
    }

    try {
      const result = await updatePassword(oldPassword, newPassword);
      if (result) {
        setPasswordSuccess("Cập nhật mật khẩu thành công!");
        // Reset fields
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";
        
        // Auto close modal after success (optional)
        setTimeout(() => {
          handleClosePasswordModal();
        }, 2000);
      } else {
        setPasswordError("Không thể cập nhật mật khẩu");
      }
    } catch (error) {
      setPasswordError("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleResetPassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    
    if (!resetEmail || !resetEmail.includes('@')) {
      setPasswordError("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    try {
      const result = await resetPassword(resetEmail);
      if (result) {
        setPasswordSuccess("Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn");
        // Auto close sau khi thành công (tùy chọn)
        setTimeout(() => {
          handleClosePasswordModal();
        }, 3000);
      } else {
        setPasswordError("Không thể gửi yêu cầu đặt lại mật khẩu");
      }
    } catch (error) {
      setPasswordError("Có lỗi xảy ra: " + error.message);
    }
  };

  const toggleForgetPassword = () => {
    setIsForgetPassword(!isForgetPassword);
    setPasswordError("");
    setPasswordSuccess("");
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
        onClick={handleOpenPasswordModal}
        startIcon={<LockIcon />}
        sx={{ mb: 2 }}
      >
        Change Password
      </Button>

      {/* Password Change/Reset Modal */}
      <Modal
        open={openPasswordModal}
        onClose={handleClosePasswordModal}
        aria-labelledby="password-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper 
          sx={{ 
            width: 400, 
            p: 3, 
            position: 'relative',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClosePasswordModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Typography id="password-modal-title" variant="h6" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
            {isForgetPassword ? "Quên mật khẩu" : "Đổi mật khẩu"}
          </Typography>
          
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}
          
          {isForgetPassword ? (
            // Quên mật khẩu form
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Vui lòng nhập địa chỉ email đăng ký tài khoản của bạn. Chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu.
              </Typography>
              <TextField
                fullWidth
                type="email"
                label="Email"
                margin="normal"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                variant="outlined"
                placeholder="user@example.com"
                autoComplete="email"
              />
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={toggleForgetPassword}
                >
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleResetPassword}
                >
                  Gửi yêu cầu
                </Button>
              </Box>
            </Box>
          ) : (
            // Đổi mật khẩu form
            <Box>
              <TextField
                fullWidth
                type="password"
                label="Mật khẩu hiện tại"
                margin="normal"
                name="currentPassword"
                id="currentPassword"
                variant="outlined"
              />
              <TextField
                fullWidth
                type="password"
                label="Mật khẩu mới"
                margin="normal"
                name="newPassword"
                id="newPassword"
                variant="outlined"
                helperText="Tối thiểu 1 ký tự in hoa và tối đa 10 ký tự"
              />
              <TextField
                fullWidth
                type="password"
                label="Xác nhận mật khẩu mới"
                margin="normal"
                name="confirmPassword"
                id="confirmPassword"
                variant="outlined"
              />
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={toggleForgetPassword}
                  size="small"
                >
                  Quên mật khẩu?
                </Button>
                <Box>
                  <Button 
                    variant="outlined" 
                    onClick={handleClosePasswordModal}
                    sx={{ mr: 1 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdatePassword}
                  >
                    Cập nhật
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Modal>
      
      {/* Other settings can go here */}
    </Box>
  );
};

export default SettingsPanel;
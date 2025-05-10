import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { BiSearch, BiUserPlus } from 'react-icons/bi';
import { sendFriendRequest } from '../../api/user';

const UserSearchModal = ({ open, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [resultMessage, setResultMessage] = useState({ type: '', message: '' });
  const [userFound, setUserFound] = useState(null);
  const handleSearch = () => {
    if (!phoneNumber.trim()) {
      setResultMessage({ type: 'error', message: 'Vui lòng nhập số điện thoại để tìm kiếm' });
      return;
    }

    setIsLoading(true);
    setSearchPerformed(true);
    
    // For now we'll simulate a user search since there's no direct API for searching users
    // In a real implementation, we might have an API endpoint to search users by phone
    setTimeout(() => {
      // Create a simulated user based on the phone number
      setUserFound({
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: 'Người dùng ' + phoneNumber,
        phone: phoneNumber,
        avatar: "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70)
      });
      setResultMessage({ type: 'success', message: 'Đã tìm thấy người dùng!' });
      setIsLoading(false);
    }, 500);
  };

  const handleSendFriendRequest = async () => {
    if (!phoneNumber.trim()) {
      setResultMessage({ type: 'error', message: 'Số điện thoại không hợp lệ' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendFriendRequest(phoneNumber);
      if (result) {
        setResultMessage({ type: 'success', message: 'Đã gửi lời mời kết bạn thành công!' });
        // Reset search after successful friend request
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setResultMessage({ type: 'error', message: 'Gửi lời mời kết bạn thất bại!' });
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      setResultMessage({
        type: 'error',
        message: error.message || 'Có lỗi xảy ra khi gửi lời mời kết bạn'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Tìm kiếm bạn bè</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Nhập số điện thoại để tìm kiếm người dùng
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nhập số điện thoại..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading || !phoneNumber.trim()}
                  startIcon={<BiSearch />}
                >
                  Tìm
                </Button>
              ),
            }}
            disabled={isLoading}
          />
        </Box>

        {isLoading && (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        )}

        {searchPerformed && !isLoading && (
          <>
            {resultMessage.type && (
              <Alert severity={resultMessage.type} sx={{ mb: 2 }}>
                {resultMessage.message}
              </Alert>
            )}

            {userFound && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box display="flex" alignItems="center">
                  <Avatar src={userFound.avatar} sx={{ width: 50, height: 50, mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1">{userFound.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{userFound.phone}</Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BiUserPlus />}
                  onClick={handleSendFriendRequest}
                  disabled={isLoading}
                >
                  Kết bạn
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSearchModal;

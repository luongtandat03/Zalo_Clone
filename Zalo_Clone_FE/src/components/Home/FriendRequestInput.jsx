import React, { useState } from "react";
import { Box, TextField, IconButton, Typography } from "@mui/material";
import { sendFriendRequest } from "../../api/user";

const FriendRequestInput = ({ 
  token, 
  isLoading, 
  setIsLoading, 
  onSuccess, 
  showSnackbar 
}) => {
  const [showInput, setShowInput] = useState(false);
  const [friendIdInput, setFriendIdInput] = useState("");

  const handleToggleInput = () => {
    setShowInput(!showInput);
    setFriendIdInput("");
  };

  const handleSendFriendRequest = async () => {
    if (!friendIdInput.trim()) {
      showSnackbar("Vui lòng nhập ID người dùng!", "error");
      return;
    }

    if (!token) {
      showSnackbar("Vui lòng đăng nhập để gửi lời mời kết bạn!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendFriendRequest(friendIdInput, token);
      if (result) {
        showSnackbar("Gửi lời mời kết bạn thành công!", "success");
        setShowInput(false);
        setFriendIdInput("");
        if (onSuccess) onSuccess();
      } else {
        showSnackbar("Gửi lời mời kết bạn thất bại!", "error");
      }
    } catch (error) {
      showSnackbar("Lỗi gửi lời mời kết bạn: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showInput && (
        <Box mt={2} display="flex" alignItems="center" gap={1}>
          <TextField
            fullWidth
            placeholder="Nhập ID người dùng"
            variant="outlined"
            size="small"
            value={friendIdInput}
            onChange={(e) => setFriendIdInput(e.target.value)}
            disabled={isLoading}
          />
          <IconButton color="primary" onClick={handleSendFriendRequest} disabled={isLoading}>
            <Typography variant="button">Gửi</Typography>
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default FriendRequestInput;
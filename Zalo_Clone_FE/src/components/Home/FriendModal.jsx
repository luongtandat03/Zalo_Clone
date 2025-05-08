import React, { useState } from 'react';
import {
  Avatar, Typography, Button, Dialog, DialogContent, List, 
  ListItem, ListItemAvatar, ListItemText, Divider, Box, Grid
} from '@mui/material';
import { Phone, MessageCircle, Slash, Trash, Settings, LogOut } from "lucide-react";
import { BiGroup, BiUndo } from "react-icons/bi";
import { deleteFriend, blockUser, unblockUser } from '../../api/user';
import { toast } from 'react-toastify';
import SettingGroup from './SettingGroup';

const FriendModal = ({ 
  open, 
  onClose, 
  profileData, 
  userId,
  token,
  onContactSelect,
  contacts,
  fetchFriendsList 
}) => {
  const [isSettingGroupOpen, setIsSettingGroupOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(profileData?.isBlocked || false);
  
  const handleOpenSettingGroup = () => {
    setIsSettingGroupOpen(true);
  };

  const handleCloseSettingGroup = () => {
    setIsSettingGroupOpen(false);
  };

  const handleBlockUser = async () => {
    if (!profileData || !profileData.id) {
      toast.error("Không tìm thấy người dùng để chặn");
      return;
    }

    const confirmBlock = window.confirm(`Bạn có chắc chắn muốn chặn ${profileData.name || "người dùng này"} không?`);
    if (!confirmBlock) return;

    try {
      const result = await blockUser(profileData.id);
      if (result) {
        setIsBlocked(true);
        toast.success("Đã chặn người dùng thành công!");
      } else {
        toast.error("Chặn người dùng thất bại!");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Có lỗi xảy ra khi chặn người dùng");
    }
  };

  const handleUnblockUser = async () => {
    if (!profileData || !profileData.id) {
      toast.error("Không tìm thấy người dùng để gỡ chặn");
      return;
    }

    const confirmUnblock = window.confirm(`Bạn có chắc chắn muốn gỡ chặn ${profileData.name || "người dùng này"} không?`);
    if (!confirmUnblock) return;

    try {
      const result = await unblockUser(profileData.id);
      if (result) {
        setIsBlocked(false);
        toast.success("Đã gỡ chặn người dùng thành công!");
      } else {
        toast.error("Gỡ chặn người dùng thất bại!");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Có lỗi xảy ra khi gỡ chặn người dùng");
    }
  };

  const handleDeleteFriend = async (friendId) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để xóa bạn bè');
      return;
    }
    try {
      const result = await deleteFriend(friendId);
      if (result) {
        toast.success('Đã xóa bạn bè thành công!');
        
        if (typeof fetchFriendsList === 'function') {
          const updatedFriends = await fetchFriendsList();
          if (updatedFriends && contacts) {
            const updatedContacts = contacts.filter(c => c.isGroup || c.id !== friendId).concat(
              updatedFriends.map(friend => ({
                id: friend.id,
                name: friend.name,
                username: friend.name,
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                status: friend.status || "offline",
                lastMessage: friend.lastMessage || "",
                unreadCount: friend.unreadCount || 0,
                timestamp: friend.timestamp || "Yesterday",
              }))
            );
            contacts.splice(0, contacts.length, ...updatedContacts);
          }
          
          if (typeof onContactSelect === 'function' && profileData?.id === friendId) {
            onContactSelect(null);
          }
        }
      } else {
        toast.error('Xóa bạn bè thất bại!');
      }
    } catch (error) {
      toast.error(`Lỗi xóa bạn bè: ${error.message}`);
    }
  };

  if (!profileData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent
        sx={{
          backgroundColor: "#ffffff",
          color: "#333",
          textAlign: 'center',
          p: 4,
          position: "relative",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Avatar
          src={profileData.avatar}
          sx={{
            width: 100,
            height: 100,
            margin: '0 auto',
            mb: 3,
            border: "3px solid",
            borderColor: "primary.main",
            boxShadow: 2,
          }}
        >
          {profileData.isGroup && <BiGroup size={40} />}
        </Avatar>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {profileData.name}
        </Typography>

        {profileData.isGroup ? (
          <>
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#1976d2",
                mb: 3,
                py: 1.5,
                borderRadius: 8,
                textTransform: "none",
                ":hover": { backgroundColor: "#1565c0" },
              }}
              startIcon={<MessageCircle size={20} />}
            >
              NHẮN TIN
            </Button>

            <Box textAlign="left" mb={3}>
              <Typography variant="h6" gutterBottom>
                Thành viên ({profileData.memberIds?.length || profileData.members?.length || 0})
              </Typography>
              <List dense sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 1 }}>
                {profileData.members?.map((member) => (
                  <ListItem key={member.id} sx={{ borderRadius: 1, mb: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar src={member.avatarGroup || '/default-avatar.png'} sx={{ width: 36, height: 36 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.name}
                      secondary={`@${member.username}`}
                      primaryTypographyProps={{ fontWeight: "medium" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box textAlign="left" mb={3}>
              <Typography variant="h6" gutterBottom>Ảnh/Video</Typography>
              {profileData.media?.length ? (
                <Grid container spacing={2}>
                  {profileData.media.map((media, index) => (
                    <Grid item xs={4} key={index}>
                      <img
                        src={media.url || '/default-media.png'}
                        alt="media"
                        style={{ width: "100%", borderRadius: 8, boxShadow: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Chưa có ảnh hoặc video nào được chia sẻ
                </Typography>
              )}
            </Box>

            <Box textAlign="left" mb={3}>
              <Typography variant="h6" gutterBottom>Link tham gia nhóm</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-word', color: "textSecondary" }}>
                {profileData.groupLink || "Chưa có link"}
              </Typography>
            </Box>

            <Divider sx={{ my: 3, bgcolor: "#e0e0e0" }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Settings size={20} />}
                onClick={handleOpenSettingGroup}
                sx={{
                  color: "#f57c00",
                  borderColor: "#f57c00",
                  py: 1.2,
                  borderRadius: 8,
                  textTransform: "none",
                  ":hover": { borderColor: "#ef6c00", color: "#ef6c00" },
                }}
              >
                QUẢN LÝ NHÓM
              </Button>

              <Button
                variant="outlined"
                startIcon={<LogOut size={20} />}
                sx={{
                  color: "#d32f2f",
                  borderColor: "#d32f2f",
                  py: 1.2,
                  borderRadius: 8,
                  textTransform: "none",
                  ":hover": { borderColor: "#c62828", color: "#c62828" },
                }}
              >
                RỜI NHÓM
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box display="flex" justifyContent="center" gap={2} mb={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#4caf50",
                  py: 1.5,
                  borderRadius: 8,
                  textTransform: "none",
                  flex: 1,
                  ":hover": { backgroundColor: "#43a047" },
                }}
                startIcon={<Phone size={20} />}
              >
                GỌI ĐIỆN
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#1976d2",
                  py: 1.5,
                  borderRadius: 8,
                  textTransform: "none",
                  flex: 1,
                  ":hover": { backgroundColor: "#1565c0" },
                }}
                startIcon={<MessageCircle size={20} />}
              >
                NHẮN TIN
              </Button>
            </Box>

            <Box textAlign="left" mb={3}>
              <Typography variant="h6" gutterBottom>Thông tin cá nhân</Typography>
              <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 2 }}>
                <Typography variant="body2" mb={1}><strong>Id:</strong> {profileData.id}</Typography>
                <Typography variant="body2" mb={1}><strong>Username:</strong> {profileData.username || "Chưa cập nhật"}</Typography>
                <Typography variant="body2" mb={1}><strong>Giới tính:</strong> {profileData.gender || "Chưa cập nhật"}</Typography>
                <Typography variant="body2" mb={1}><strong>Ngày sinh:</strong> {profileData.birthday || "--/--/----"}</Typography>
                <Typography variant="body2" mb={1}><strong>Điện thoại:</strong> {profileData.phone || "Chưa cập nhật"}</Typography>
              </Box>
            </Box>

            <Box textAlign="left" mb={3}>
              <Typography variant="h6" gutterBottom>Hình ảnh</Typography>
              {profileData.media?.length ? (
                <Grid container spacing={2}>
                  {profileData.media.map((media, index) => (
                    <Grid item xs={4} key={index}>
                      <img
                        src={media.url}
                        alt="media"
                        style={{ width: "100%", borderRadius: 8, boxShadow: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Chưa có ảnh nào được chia sẻ
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3, bgcolor: "#e0e0e0" }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                color={isBlocked ? "success" : "warning"}
                startIcon={isBlocked ? <BiUndo size={20} /> : <Slash size={20} />}
                onClick={isBlocked ? handleUnblockUser : handleBlockUser}
                sx={{
                  color: isBlocked ? "#4caf50" : "#f57c00",
                  borderColor: isBlocked ? "#4caf50" : "#f57c00",
                  py: 1.2,
                  borderRadius: 8,
                  textTransform: "none",
                  ":hover": { borderColor: isBlocked ? "#43a047" : "#ef6c00", color: isBlocked ? "#43a047" : "#ef6c00" },
                }}
              >
                {isBlocked ? "GỠ CHẶN TIN NHẮN VÀ CUỘC GỌI" : "CHẶN TIN NHẮN VÀ CUỘC GỌI"}
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash size={20} />}
                sx={{
                  color: "#d32f2f",
                  borderColor: "#d32f2f",
                  py: 1.2,
                  borderRadius: 8,
                  textTransform: "none",
                  ":hover": { borderColor: "#c62828", color: "#c62828" },
                }}
                onClick={() => handleDeleteFriend(profileData.id)}
              >
                XÓA KHỎI DANH SÁCH BẠN BÈ
              </Button>
            </Box>
          </>
        )}

        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            backgroundColor: "#757575",
            py: 1.5,
            borderRadius: 8,
            textTransform: "none",
            ":hover": { backgroundColor: "#616161" },
          }}
        >
          ĐÓNG
        </Button>

        {profileData.isGroup && (
          <SettingGroup
            open={isSettingGroupOpen}
            onClose={handleCloseSettingGroup}
            groupId={profileData?.id}
            token={token}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FriendModal;
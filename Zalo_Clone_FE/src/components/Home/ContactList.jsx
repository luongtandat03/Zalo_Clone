import React from "react";
import {
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Badge, TextField,
  InputAdornment, Typography, Button, Dialog, DialogContent, Divider, Box, Grid
} from "@mui/material";
import { BiSearch, BiGroup } from "react-icons/bi";
import { Phone, MessageCircle, Slash, Trash, Settings, LogOut } from "lucide-react";
import { fetchFriendsList } from "../../api/user"; // Import fetchFriendsList

const ContactList = ({
  contacts,
  selectedContact,
  onContactSelect,
  pendingRequests,
  onAcceptFriendRequest,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [profileData, setProfileData] = React.useState(null);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProfileOpen = (contact) => {
    setProfileData(contact);
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
    setProfileData(null);
  };

  const handleDeleteFriend = async (friendId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error('Vui lòng đăng nhập để xóa bạn bè');
        return;
      }
      const result = await deleteFriend(friendId);
      if (result) {
        toast.success('Đã xóa bạn bè thành công!');
        // Update contacts list
        const updatedFriends = await fetchFriendsList();
        if (updatedFriends) {
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
        // Clear selected contact if deleted
        if (selectedContact?.id === friendId) {
          onContactSelect(null);
        }
      } else {
        toast.error('Xóa bạn bè thất bại!');
      }
    } catch (error) {
      toast.error(`Lỗi xóa bạn bè: ${error.message}`);
    }
  };

  return (
    <>
      <TextField
        fullWidth
        placeholder="Tìm kiếm"
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <BiSearch />
            </InputAdornment>
          ),
        }}
      />

      {pendingRequests?.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ px: 2, mb: 1, fontWeight: "bold" }}>
            Lời mời kết bạn ({pendingRequests.length})
          </Typography>
          <List sx={{ overflow: "auto", mb: 2 }}>
            {pendingRequests.map((request) => (
              <ListItem
                key={request.id}
                secondaryAction={
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onAcceptFriendRequest(request.id)}
                    disabled={isLoading}
                  >
                    Chấp nhận
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar src={request.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} />
                </ListItemAvatar>
                <ListItemText
                  primary={request.name}
                  secondary="Đã gửi lời mời kết bạn"
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Typography variant="subtitle1" sx={{ px: 2, mb: 1, fontWeight: "bold" }}>
        Danh sách nhóm và bạn bè
      </Typography>
      <List sx={{ overflow: "auto", flex: 1 }}>
        {filteredContacts.map((contact) => (
          <ListItem
            key={contact.id}
            button
            selected={selectedContact?.id === contact.id}
            onClick={() => onContactSelect(contact)}
          >
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                color={contact.isGroup ? "default" : contact.status === "online" ? "success" : "error"}
              >
                <Avatar
                  src={contact.avatar}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileOpen(contact);
                  }}
                >
                  {contact.isGroup && <BiGroup />}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle1" fontWeight="medium">
                  {contact.isGroup ? `[Nhóm] ${contact.name}` : `@${contact.username}`}
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="textSecondary" noWrap>
                  {contact.lastMessage}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={isProfileOpen} onClose={handleProfileClose} maxWidth="xs" fullWidth>
        {profileData && (
          <DialogContent
            sx={{
              backgroundColor: "#1e1e1e",
              color: "white",
              textAlign: 'center',
              p: 3,
              position: "relative",
            }}
          >
            <Avatar
              src={profileData.avatar}
              sx={{ width: 80, height: 80, margin: '0 auto', mb: 2 }}
            >
              {profileData.isGroup && <BiGroup />}
            </Avatar>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              {profileData.name}
            </Typography>

            {profileData.isGroup ? (
              <>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ backgroundColor: "#3498db", mb: 2, ":hover": { backgroundColor: "#2980b9" } }}
                  startIcon={<MessageCircle />}
                >
                  NHẮN TIN
                </Button>

                <Box textAlign="left" mb={2}>
                  <Typography variant="subtitle1" gutterBottom>Thành viên ({profileData.memberIds?.length || 0})</Typography>
                  <List dense>
                    {profileData.members?.map((member) => (
                      <ListItem key={member.id}>
                        <ListItemAvatar>
                          <Avatar src={member.avatarGroup || '/default-avatar.png'} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.name}
                          secondary={`@${member.username}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box textAlign="left" mb={2}>
                  <Typography variant="subtitle1" gutterBottom>Ảnh/Video</Typography>
                  {profileData.media?.length ? (
                    <Grid container spacing={1}>
                      {profileData.media.map((media, index) => (
                        <Grid item xs={4} key={index}>
                          <img
                            src={media.url || '/default-media.png'}
                            alt="media"
                            style={{ width: "100%", borderRadius: 8 }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2">Chưa có ảnh hoặc video nào được chia sẻ</Typography>
                  )}
                </Box>

                <Box textAlign="left" mb={2}>
                  <Typography variant="subtitle1" gutterBottom>Link tham gia nhóm</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {profileData.groupLink || "Chưa có link"}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, bgcolor: "#555" }} />

                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    sx={{
                      color: "#f1c40f",
                      borderColor: "#f1c40f",
                      ":hover": { borderColor: "#f39c12", color: "#f39c12" },
                    }}
                  >
                    QUẢN LÝ NHÓM
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<LogOut />}
                    sx={{
                      color: "#e74c3c",
                      borderColor: "#e74c3c",
                      ":hover": { borderColor: "#c0392b", color: "#c0392b" },
                    }}
                  >
                    RỜI NHÓM
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Box display="flex" justifyContent="center" gap={2} mb={2}>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#2ecc71", ":hover": { backgroundColor: "#27ae60" } }}
                    fullWidth
                    startIcon={<Phone />}
                  >
                    GỌI ĐIỆN
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#3498db", ":hover": { backgroundColor: "#2980b9" } }}
                    fullWidth
                    startIcon={<MessageCircle />}
                  >
                    NHẮN TIN
                  </Button>
                </Box>

                <Box textAlign="left" mb={2}>
                  <Typography variant="subtitle1" gutterBottom>Thông tin cá nhân</Typography>
                  <Typography variant="body2" mb={0.5}><strong>Id Sala:</strong> {profileData.id}</Typography>
                  <Typography variant="body2" mb={0.5}><strong>Username:</strong> {profileData.username || "Chưa cập nhật"}</Typography>
                  <Typography variant="body2" mb={0.5}><strong>Giới tính:</strong> {profileData.gender || "Chưa cập nhật"}</Typography>
                  <Typography variant="body2" mb={0.5}><strong>Ngày sinh:</strong> {profileData.birthday || "--/--/----"}</Typography>
                  <Typography variant="body2" mb={0.5}><strong>Điện thoại:</strong> {profileData.phone || "Chưa cập nhật"}</Typography>
                </Box>

                <Box textAlign="left" mb={2}>
                  <Typography variant="subtitle1" gutterBottom>Hình ảnh</Typography>
                  {profileData.media?.length ? (
                    <Grid container spacing={1}>
                      {profileData.media.map((media, index) => (
                        <Grid item xs={4} key={index}>
                          <img
                            src={media.url}
                            alt="media"
                            style={{ width: "100%", borderRadius: 8 }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2">Chưa có ảnh nào được chia sẻ</Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2, bgcolor: "#555" }} />

                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Slash />}
                    sx={{
                      color: "#f1c40f",
                      borderColor: "#f1c40f",
                      ":hover": { borderColor: "#f39c12", color: "#f39c12" },
                    }}
                  >
                    CHẶN TIN NHẮN VÀ CUỘC GỌI
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Trash />}
                    sx={{
                      color: "#e74c3c",
                      borderColor: "#e74c3c",
                      ":hover": { borderColor: "#c0392b", color: "#c0392b" },
                    }}
                    onClick={() => handleDeleteFriend(profileData.id)}
                  >
                    XÓA KHỎI DANH SÁCH BẠN BÈ
                  </Button>
                </Box>
              </>
            )}

            <Button
              onClick={handleProfileClose}
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: "#7f8c8d", ":hover": { backgroundColor: "#95a5a6" } }}
            >
              ĐÓNG
            </Button>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default ContactList;
import React, { useState } from "react";
import {
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Badge, TextField,
  InputAdornment, Typography, Button, Box
} from "@mui/material";
import { BiSearch, BiGroup } from "react-icons/bi";
import { fetchFriendsList } from "../../api/user";
import ProfileModal from "./ProfileModal";

const ContactList = ({
  contacts,
  selectedContact,
  onContactSelect,
  pendingRequests,
  onAcceptFriendRequest,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

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

      {/* Use our new ProfileModal component */}
      <ProfileModal
        open={isProfileOpen}
        onClose={handleProfileClose}
        profileData={profileData}
        userId={userId}
        token={token}
        contacts={contacts}
        onContactSelect={onContactSelect}
        fetchFriendsList={fetchFriendsList}
      />
    </>
  );
};

export default ContactList;
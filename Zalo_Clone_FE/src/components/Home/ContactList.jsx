import React, { useState } from "react";
import {
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Badge, TextField,
  InputAdornment, Typography, Button, Box
} from "@mui/material";
import { BiSearch, BiGroup } from "react-icons/bi";
import { fetchFriendsList, cancelFriendRequest } from "../../api/user";
import ProfileModal from "./ProfileModal";
import { toast } from "react-toastify";

const ContactList = ({
  contacts,
  selectedContact,
  onContactSelect,
  pendingRequests,
  onAcceptFriendRequest,
  isLoading,
  fetchPendingFriendRequests,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleCancelRequest = async (requestId) => {
    try {
      const result = await cancelFriendRequest(requestId);
      if (result) {
        toast.dismiss(); 
        toast.success(result.message || "Đã hủy lời mời kết bạn ");
        await fetchPendingFriendRequests();
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Hủy lời mời kết bạn thất bại");
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
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => onAcceptFriendRequest(request.requestId)}
                      disabled={isLoading}
                    >
                      Chấp nhận
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleCancelRequest(request.requestId)}
                      disabled={isLoading}
                      sx={{ ml: 1 }}
                    >
                      Từ chối
                    </Button>
                  </>
                }
              >
                <ListItemAvatar>
                  <Avatar src={request.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} />
                </ListItemAvatar>
                <ListItemText
                  primary={request.lastName}
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
                <Avatar src={contact.avatar}>
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

      <ProfileModal
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

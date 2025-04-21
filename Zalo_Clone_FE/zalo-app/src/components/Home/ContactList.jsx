import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button,
  Box,
} from "@mui/material";
import { BiSearch } from "react-icons/bi";
import { sendFriendRequest } from "../../api/user"; // Import hàm sendFriendRequest

const ContactList = ({
  contacts,
  friends,
  pendingRequests,
  selectedContact,
  onContactSelect,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [newFriendId, setNewFriendId] = useState("");

  const sendFriendRequestHandler = () => {
    if (!newFriendId) return;
    sendFriendRequest(newFriendId).then((data) => {
      if (data) {
        alert("Lời mời kết bạn đã được gửi!");
        setNewFriendId("");
      } else {
        alert("Lỗi khi gửi lời mời kết bạn!");
      }
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Liên hệ" />
        <Tab label="Bạn bè" />
        <Tab label="Lời mời" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <TextField
            fullWidth
            placeholder="Search"
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BiSearch />
                </InputAdornment>
              ),
            }}
          />
          <List sx={{ overflow: "auto", flex: 1 }}>
            {contacts.map((contact) => (
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
                    color={contact.status === "online" ? "success" : "error"}
                  >
                    <Avatar src={contact.avatar} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={contact.name}
                  secondary={contact.lastMessage}
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {tabValue === 1 && (
        <>
          <TextField
            fullWidth
            placeholder="Search friends"
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BiSearch />
                </InputAdornment>
              ),
            }}
          />
          <List sx={{ overflow: "auto", flex: 1 }}>
            {friends.map((friend) => (
              <ListItem
                key={friend.userId}
                button
                onClick={() => onContactSelect(friend)}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                    color={friend.status === "online" ? "success" : "error"}
                  >
                    <Avatar src={friend.avatar} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={friend.username}
                  secondary={friend.lastMessage || "No messages yet"}
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ p: 2, borderTop: "1px solid #ddd" }}>
            <TextField
              fullWidth
              placeholder="Nhập ID người dùng"
              variant="outlined"
              size="small"
              value={newFriendId}
              onChange={(e) => setNewFriendId(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={sendFriendRequestHandler}
            >
              Gửi lời mời kết bạn
            </Button>
          </Box>
        </>
      )}

      {tabValue === 2 && (
        <List sx={{ overflow: "auto", flex: 1 }}>
          {pendingRequests.map((request) => (
            <ListItem key={request.userId}>
              <ListItemAvatar>
                <Avatar src={request.avatar} />
              </ListItemAvatar>
              <ListItemText
                primary={request.username}
                secondary="Đã gửi lời mời kết bạn"
                secondaryTypographyProps={{ noWrap: true }}
              />
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => onAcceptFriendRequest(request.userId)}
                sx={{ mr: 1 }}
              >
                Chấp nhận
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => onDeclineFriendRequest(request.userId)}
              >
                Từ chối
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ContactList;
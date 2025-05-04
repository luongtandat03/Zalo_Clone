import React from "react";
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Badge, TextField, InputAdornment, Typography, Button } from "@mui/material";
import { BiSearch } from "react-icons/bi";

const ContactList = ({ contacts, selectedContact, onContactSelect, pendingRequests, onAcceptFriendRequest, isLoading }) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <TextField
        fullWidth
        placeholder="Search"
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

      {/* Hiển thị danh sách lời mời kết bạn đang chờ */}
      {pendingRequests && pendingRequests.length > 0 && (
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

      {/* Danh sách bạn bè */}
      <Typography variant="subtitle1" sx={{ px: 2, mb: 1, fontWeight: "bold" }}>
        Danh sách bạn bè
      </Typography>
      <List sx={{ overflow: "auto", flex: 1 }}>
        {filteredContacts.map((contact) => (
          <ListItem
            key={contact.id}
            button // Thuộc tính button bật chế độ tương tác, không cần giá trị
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
              primary={
                <Typography variant="subtitle1" fontWeight="medium">
                  @{contact.username}
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
    </>
  );
};

export default ContactList;
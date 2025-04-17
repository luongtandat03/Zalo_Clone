import React from "react";
import { Box, Avatar, Typography, IconButton, TextField, Paper, styled } from "@mui/material";
import { BiPhone, BiVideo, BiDotsVerticalRounded, BiSmile, BiPaperclip, BiSend } from "react-icons/bi";

const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
}));

const MessageContainer = styled(Box)(({ isSender }) => ({
  display: "flex",
  justifyContent: isSender ? "flex-end" : "flex-start",
  marginBottom: 2,
  padding: "8px 16px",
}));

const MessageBubble = styled(Paper)(({ isSender, theme }) => ({
  padding: "8px 16px",
  backgroundColor: isSender ? theme.palette.primary.main : theme.palette.secondary.main,
  color: isSender ? "white" : "inherit",
  borderRadius: 20,
}));

const ChatWindow = ({ selectedContact, messages, messageInput, onMessageInputChange, onSendMessage, onProfileOpen, userId }) => {
  if (!selectedContact) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Typography variant="h6" color="text.secondary">
          Select a conversation to start messaging
        </Typography>
      </Box>
    );
  }

  return (
    <ChatContainer>
      <Box p={2} display="flex" alignItems="center" borderBottom={1} borderColor="divider">
        <Avatar
          src={selectedContact.avatar}
          sx={{ cursor: "pointer" }}
          onClick={() => onProfileOpen(selectedContact)}
        />
        <Box ml={2} flex={1} sx={{ cursor: "pointer" }} onClick={() => onProfileOpen(selectedContact)}>
          <Typography variant="subtitle1">{selectedContact.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            {selectedContact.status === "online" ? "Online" : "Offline"}
          </Typography>
        </Box>
        <IconButton>
          <BiPhone />
        </IconButton>
        <IconButton>
          <BiVideo />
        </IconButton>
        <IconButton>
          <BiDotsVerticalRounded />
        </IconButton>
      </Box>

      <Box flex={1} overflow="auto" p={2} sx={{ bgcolor: "background.default" }}>
        {messages.map((message) => (
          <MessageContainer key={message.id} isSender={message.senderId === userId}>
            <MessageBubble isSender={message.senderId === userId}>
              <Typography>{message.text}</Typography>
              <Typography variant="caption" display="block" textAlign="right" sx={{ opacity: 0.7 }}>
                {message.timestamp}
              </Typography>
            </MessageBubble>
          </MessageContainer>
        ))}
      </Box>

      <Box p={2} borderTop={1} borderColor="divider" sx={{ bgcolor: "background.paper" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small">
            <BiSmile />
          </IconButton>
          <IconButton size="small">
            <BiPaperclip />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Type a message"
            variant="outlined"
            size="small"
            value={messageInput}
            onChange={onMessageInputChange}
            onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          />
          <IconButton color="primary" onClick={onSendMessage} disabled={!messageInput.trim()}>
            <BiSend />
          </IconButton>
        </Box>
      </Box>
    </ChatContainer>
  );
};

export default ChatWindow;
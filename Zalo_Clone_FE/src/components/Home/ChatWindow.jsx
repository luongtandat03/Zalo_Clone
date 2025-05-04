import React, { useEffect, useState, useRef } from 'react';
import { Box, Avatar, Typography, IconButton, TextField, Paper, styled, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { BiPhone, BiVideo, BiDotsVerticalRounded, BiSmile, BiPaperclip, BiSend, BiUndo, BiTrash, BiShare } from 'react-icons/bi';
import { sendMessage, uploadFile, recallMessage, deleteMessage, forwardMessage, generateTempId } from '../../api/messageApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const MessageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSender',
})(({ isSender }) => ({
  display: 'flex',
  justifyContent: isSender ? 'flex-end' : 'flex-start',
  marginBottom: 2,
  padding: '8px 16px',
  alignItems: 'center',
}));

const MessageBubble = styled(Paper)(({ isSender, theme }) => ({
  padding: '8px 16px',
  backgroundColor: isSender ? theme.palette.primary.main : theme.palette.secondary.main,
  color: isSender ? 'white' : 'inherit',
  borderRadius: 20,
}));

const ChatWindow = ({ selectedContact, messages, messageInput, onMessageInputChange, onSendMessage, onProfileOpen, userId, contacts }) => {
  const [localMessages, setLocalMessages] = useState(messages);
  const [isSending, setIsSending] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const token = localStorage.getItem('accessToken');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    if (!token) {
      toast.error('Vui lòng đăng nhập để gửi tin nhắn');
      return;
    }

    setIsSending(true);

    const tempId = generateTempId();
    const message = {
      senderId: userId,
      receiverId: selectedContact?.id,
      content: messageInput,
      type: 'TEXT',
      tempId: tempId,
    };

    try {
      console.log('Attempting to send message:', message);
      const success = sendMessage('/app/chat.send', message, token);
      if (success) {
        const newMessage = {
          ...message,
          createAt: new Date().toISOString(),
          recalled: false,
          deletedByUsers: [],
          isRead: false,
        };
        setLocalMessages((prev) => [...prev, newMessage]);
        onMessageInputChange({ target: { value: '' } });
        onSendMessage(newMessage);
        toast.success('Tin nhắn đã được gửi!');
      } else {
        toast.error('Không thể gửi tin nhắn: WebSocket không hoạt động');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(`Lỗi gửi tin nhắn: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    if (!token) {
      toast.error('Vui lòng đăng nhập để gửi file');
      return;
    }

    setIsSending(true);
    try {
      const fileUrls = await uploadFile(files, selectedContact?.id, token);
      fileUrls.forEach(url => {
        const file = files[0];
        const contentType = file.type || '';
        let type = 'FILE';
        if (contentType.startsWith('image/')) {
          type = 'IMAGE';
        } else if (contentType.startsWith('video/')) {
          type = 'VIDEO';
        } else if (contentType === 'application/zip' || contentType === 'application/x-rar-compressed') {
          type = 'FILE';
        }

        const tempId = generateTempId();
        const message = {
          senderId: userId,
          receiverId: selectedContact?.id,
          content: url,
          type: type,
          tempId: tempId,
          createAt: new Date().toISOString(),
          recalled: false,
          deletedByUsers: [],
          isRead: false,
        };
        setLocalMessages((prev) => [...prev, message]);
        onSendMessage(message);
      });
      toast.success('File đã được gửi!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Lỗi gửi file: ${error.message}`);
    } finally {
      setIsSending(false);
      fileInputRef.current.value = '';
    }
  };

  const handleRecallMessage = (message) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để thu hồi tin nhắn');
      return;
    }

    setIsSending(true);
    try {
      const identifier = message.id || message.tempId;
      if (!identifier) {
        throw new Error('Missing message identifier');
      }
      const success = recallMessage(identifier, userId, token);
      if (success) {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            (msg.id && msg.id === message.id) || (msg.tempId === message.tempId)
              ? { ...msg, recalled: true }
              : msg
          )
        );
        onSendMessage({ 
          id: message.id, 
          tempId: message.tempId,
          recalled: true 
        });
        toast.success('Tin nhắn đã được thu hồi!');
      } else {
        toast.error('Không thể thu hồi tin nhắn: WebSocket không hoạt động');
      }
    } catch (error) {
      console.error('Error recalling message:', error);
      toast.error(`Lỗi thu hồi tin nhắn: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = (message) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để xóa tin nhắn');
      return;
    }

    setIsSending(true);
    try {
      const identifier = message.id || message.tempId;
      if (!identifier) {
        throw new Error('Missing message identifier');
      }
      const success = deleteMessage(identifier, userId, token);
      if (success) {
        const deletedMessageIds = JSON.parse(localStorage.getItem('deletedMessageIds') || '[]');
        if (message.id && !deletedMessageIds.includes(message.id)) {
          deletedMessageIds.push(message.id);
          localStorage.setItem('deletedMessageIds', JSON.stringify(deletedMessageIds));
        }

        setLocalMessages((prev) =>
          prev.map((msg) =>
            (msg.id && msg.id === message.id) || (msg.tempId === message.tempId)
              ? { ...msg, deletedByUsers: [...(msg.deletedByUsers || []), userId] }
              : msg
          )
        );
        onSendMessage({ 
          id: message.id, 
          tempId: message.tempId,
          deletedByUsers: [...(message.deletedByUsers || []), userId] 
        });
        toast.success('Tin nhắn đã được xóa!');
      } else {
        toast.error('Không thể xóa tin nhắn: WebSocket không hoạt động');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(`Lỗi xóa tin nhắn: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenForwardDialog = (message) => {
    setForwardMessage(message);
    setForwardDialogOpen(true);
  };

  const handleForwardMessage = (contact) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để chuyển tiếp tin nhắn');
      return;
    }

    setIsSending(true);
    try {
      const identifier = forwardMessage.id || forwardMessage.tempId;
      if (!identifier) {
        throw new Error('Missing message identifier');
      }
      const success = forwardMessage(
        identifier,
        userId,
        contact.id,
        null,
        forwardMessage.content,
        token
      );
      if (success) {
        const tempId = generateTempId();
        const newMessage = {
          senderId: userId,
          receiverId: contact.id,
          content: forwardMessage.content,
          type: 'FORWARD',
          forwardedFrom: { messageId: forwardMessage.id, senderId: userId },
          tempId: tempId,
          createAt: new Date().toISOString(),
          recalled: false,
          deletedByUsers: [],
          isRead: false,
        };
        setLocalMessages((prev) => [...prev, newMessage]);
        onSendMessage(newMessage);
        toast.success('Tin nhắn đã được chuyển tiếp!');
      } else {
        toast.error('Không thể chuyển tiếp tin nhắn: WebSocket không hoạt động');
      }
    } catch (error) {
      console.error('Error forwarding message:', error);
      toast.error(`Lỗi chuyển tiếp tin nhắn: ${error.message}`);
    } finally {
      setIsSending(false);
      setForwardDialogOpen(false);
      setForwardMessage(null);
    }
  };

  if (!selectedContact) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Typography variant="h6" color="text.secondary">
          Chọn một cuộc trò chuyện để bắt đầu nhắn tin
        </Typography>
      </Box>
    );
  }

  return (
    <ChatContainer>
      <Box p={2} display="flex" alignItems="center" borderBottom={1} borderColor="divider">
        <Avatar
          src={selectedContact.avatar}
          sx={{ cursor: 'pointer' }}
          onClick={() => onProfileOpen(selectedContact)}
        />
        <Box ml={2} flex={1} sx={{ cursor: 'pointer' }} onClick={() => onProfileOpen(selectedContact)}>
          <Typography variant="subtitle1">{selectedContact.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            {selectedContact.status === 'online' ? 'Online' : 'Offline'}
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

      <Box flex={1} overflow="auto" p={2} sx={{ bgcolor: 'background.default' }}>
        {localMessages.map((message, index) => (
          <MessageContainer key={message.id || message.tempId || (message.createAt + message.senderId + index)} isSender={message.senderId === userId}>
            {message.senderId === userId && !message.recalled && !(message.deletedByUsers?.includes(userId)) && (
              <Box display="flex" flexDirection="column" mr={1}>
                <IconButton size="small" onClick={() => handleRecallMessage(message)} disabled={isSending}>
                  <BiUndo />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteMessage(message)} disabled={isSending}>
                  <BiTrash />
                </IconButton>
                <IconButton size="small" onClick={() => handleOpenForwardDialog(message)} disabled={isSending}>
                  <BiShare />
                </IconButton>
              </Box>
            )}
            <MessageBubble isSender={message.senderId === userId}>
              {message.recalled ? (
                <Typography fontStyle="italic">Tin nhắn đã được thu hồi</Typography>
              ) : message.deletedByUsers?.includes(userId) ? (
                <Typography fontStyle="italic">Tin nhắn đã bị xóa</Typography>
              ) : message.type === 'TEXT' ? (
                <Typography>{message.content}</Typography>
              ) : message.type === 'IMAGE' ? (
                <img src={message.content} alt="Uploaded" style={{ maxWidth: '200px', borderRadius: '8px' }} />
              ) : message.type === 'VIDEO' ? (
                <video src={message.content} controls style={{ maxWidth: '200px', borderRadius: '8px' }} />
              ) : message.type === 'FORWARD' ? (
                <Box>
                  <Typography fontStyle="italic" variant="caption">
                    Chuyển tiếp từ {message.forwardedFrom?.senderId || 'người dùng khác'}
                  </Typography>
                  <Typography>{message.content}</Typography>
                </Box>
              ) : (
                <a href={message.content} target="_blank" rel="noopener noreferrer">Xem file</a>
              )}
              <Typography variant="caption" display="block" textAlign="right" sx={{ opacity: 0.7 }}>
                {new Date(message.createAt).toLocaleTimeString()}
              </Typography>
            </MessageBubble>
          </MessageContainer>
        ))}
      </Box>

      <Box p={2} borderTop={1} borderColor="divider" sx={{ bgcolor: 'background.paper' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small">
            <BiSmile />
          </IconButton>
          <IconButton size="small" component="label">
            <BiPaperclip />
            <input
              type="file"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*,application/zip,application/x-rar-compressed"
            />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Nhập tin nhắn"
            variant="outlined"
            size="small"
            value={messageInput}
            onChange={onMessageInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <IconButton color="primary" onClick={handleSendMessage} disabled={!messageInput.trim() || isSending}>
            <BiSend />
          </IconButton>
        </Box>
      </Box>

      <Dialog open={forwardDialogOpen} onClose={() => setForwardDialogOpen(false)}>
        <DialogTitle>Chọn liên hệ để chuyển tiếp</DialogTitle>
        <DialogContent>
          <List>
            {contacts.map((contact) => (
              <ListItem button key={contact.id} onClick={() => handleForwardMessage(contact)}>
                <ListItemAvatar>
                  <Avatar src={contact.avatar} />
                </ListItemAvatar>
                <ListItemText primary={contact.name} secondary={contact.username} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </ChatContainer>
  );
};

export default ChatWindow;
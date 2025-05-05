import React, { useEffect, useState, useRef } from 'react';
import { Box, Avatar, Typography, IconButton, TextField, Paper, styled, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { BiPhone, BiVideo, BiDotsVerticalRounded, BiSmile, BiPaperclip, BiSend, BiUndo, BiTrash, BiShare, BiGroup } from 'react-icons/bi';
import { sendMessage, uploadFile, recallMessage, deleteMessage, forwardMessage } from '../../api/messageApi';
import { fetchGroupMembers } from '../../api/groupApi';
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
  const [messageToForward, setMessageToForward] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const token = localStorage.getItem('accessToken');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const uniqueMessages = messages.reduce((acc, msg) => {
      if (!acc.some(item => item.id === msg.id)) {
        acc.push(msg);
      }
      return acc;
    }, []);
    setLocalMessages(uniqueMessages);
  }, [messages]);

  useEffect(() => {
    if (selectedContact?.isGroup) {
      fetchGroupMembers(selectedContact.id, token)
        .then(members => {
          setGroupMembers(members);
        })
        .catch(error => {
          console.error('Error fetching group members:', error);
        });
    } else {
      setGroupMembers([]);
    }
  }, [selectedContact, token]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    if (!token) {
      toast.error('Vui lòng đăng nhập để gửi tin nhắn');
      return;
    }

    setIsSending(true);

    const tempKey = `${Date.now()}-${messageInput}`;
    const message = {
      senderId: userId,
      [selectedContact.isGroup ? 'groupId' : 'receiverId']: selectedContact.id,
      content: messageInput,
      type: 'TEXT',
      tempKey: tempKey,
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
      const fileUrls = await uploadFile(
        files,
        selectedContact.isGroup ? null : selectedContact.id,
        token,
        selectedContact.isGroup ? selectedContact.id : null
      );
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

        const tempKey = `${Date.now()}-${url}`;
        const message = {
          senderId: userId,
          [selectedContact.isGroup ? 'groupId' : 'receiverId']: selectedContact.id,
          content: url,
          type: type,
          tempKey: tempKey,
          createAt: new Date().toISOString(),
          recalled: false,
          deletedByUsers: [],
          isRead: false,
        };
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
      const identifier = message.id;
      if (!identifier) {
        throw new Error('Missing message identifier.');
      }
      const success = recallMessage(identifier, userId, token);
      if (success) {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id
              ? { ...msg, recalled: true }
              : msg
          )
        );
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
      const identifier = message.id;
      if (!identifier) {
        throw new Error('Missing message identifier.');
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
            msg.id === message.id
              ? { ...msg, deletedByUsers: [...(msg.deletedByUsers || []), userId] }
              : msg
          )
        );
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
    setMessageToForward(message);
    setForwardDialogOpen(true);
  };

  const handleForwardMessage = (contact) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để chuyển tiếp tin nhắn');
      return;
    }

    setIsSending(true);
    try {
      const identifier = messageToForward?.id;
      if (!identifier) {
        throw new Error('Missing message identifier.');
      }
      const success = forwardMessage(
        identifier,
        userId,
        contact.isGroup ? null : contact.id,
        contact.isGroup ? contact.id : null,
        messageToForward.content,
        token
      );
      if (success) {
        const tempKey = `${Date.now()}-${messageToForward.content}`;
        const newMessage = {
          senderId: userId,
          [contact.isGroup ? 'groupId' : 'receiverId']: contact.id,
          content: messageToForward.content,
          type: 'FORWARD',
          forwardedFrom: { messageId: messageToForward.id, senderId: userId },
          tempKey: tempKey,
          createAt: new Date().toISOString(),
          recalled: false,
          deletedByUsers: [],
          isRead: false,
        };
        onSendMessage(newMessage);
        toast.success('Tin nhắn đã được chuyển tiếp!');
      } else {
        toast.error('Không thể chuyển tiếp tin nhắn: WebSocket không hoạt động');
      }
    } catch (error) {
      console.error('Lỗi chuyển tiếp tin nhắn:', error);
      toast.error(`Lỗi chuyển tiếp tin nhắn: ${error.message}`);
    } finally {
      setIsSending(false);
      setForwardDialogOpen(false);
      setMessageToForward(null);
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
        >
          {selectedContact.isGroup && <BiGroup />}
        </Avatar>
        <Box ml={2} flex={1} sx={{ cursor: 'pointer' }} onClick={() => onProfileOpen(selectedContact)}>
          <Typography variant="subtitle1">{selectedContact.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            {selectedContact.isGroup
              ? `Nhóm (${groupMembers.length} thành viên)`
              : selectedContact.status === 'online' ? 'Online' : 'Offline'}
          </Typography>
        </Box>
        {selectedContact.isGroup ? (
          <IconButton onClick={() => onProfileOpen({ ...selectedContact, members: groupMembers })}>
            <BiDotsVerticalRounded />
          </IconButton>
        ) : (
          <>
            <IconButton>
              <BiPhone />
            </IconButton>
            <IconButton>
              <BiVideo />
            </IconButton>
            <IconButton>
              <BiDotsVerticalRounded />
            </IconButton>
          </>
        )}
      </Box>

      <Box flex={1} overflow="auto" p={2} sx={{ bgcolor: 'background.default' }}>
        {localMessages.map((message, index) => (
          <MessageContainer 
            key={message.id ? `${message.id}-${index}` : (message.tempKey ? `${message.tempKey}-${index}` : `${message.createAt}-${message.senderId}-${index}`)} 
            isSender={message.senderId === userId}
          >
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
              ) : (message.deletedByUsers?.includes(message.senderId) || message.deletedByUsers?.includes(message.receiverId) || message.deletedByUsers?.includes(userId)) ? (
                <Typography fontStyle="italic">Tin nhắn đã bị xóa</Typography>
              ) : message.type === 'TEXT' ? (
                <>
                  {selectedContact.isGroup && message.senderId !== userId && (
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7, mb: 1 }}>
                      {groupMembers.find(m => m.id === message.senderId)?.username || 'Unknown'}
                    </Typography>
                  )}
                  <Typography>{message.content}</Typography>
                </>
              ) : message.type === 'IMAGE' ? (
                <>
                  {selectedContact.isGroup && message.senderId !== userId && (
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7, mb: 1 }}>
                      {groupMembers.find(m => m.id === message.senderId)?.username || 'Unknown'}
                    </Typography>
                  )}
                  <img src={message.content} alt="Uploaded" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                </>
              ) : message.type === 'VIDEO' ? (
                <>
                  {selectedContact.isGroup && message.senderId !== userId && (
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7, mb: 1 }}>
                      {groupMembers.find(m => m.id === message.senderId)?.username || 'Unknown'}
                    </Typography>
                  )}
                  <video src={message.content} controls style={{ maxWidth: '200px', borderRadius: '8px' }} />
                </>
              ) : message.type === 'FORWARD' ? (
                <>
                  {selectedContact.isGroup && message.senderId !== userId && (
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7, mb: 1 }}>
                      {groupMembers.find(m => m.id === message.senderId)?.username || 'Unknown'}
                    </Typography>
                  )}
                  <Box>
                    <Typography fontStyle="italic" variant="caption">
                      Chuyển tiếp từ {message.forwardedFrom?.senderId || 'người dùng khác'}
                    </Typography>
                    <Typography>{message.content}</Typography>
                  </Box>
                </>
              ) : (
                <>
                  {selectedContact.isGroup && message.senderId !== userId && (
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7, mb: 1 }}>
                      {groupMembers.find(m => m.id === message.senderId)?.username || 'Unknown'}
                    </Typography>
                  )}
                  <a href={message.content} target="_blank" rel="noopener noreferrer">Xem file</a>
                </>
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
        <DialogTitle>Chọn liên hệ hoặc nhóm để chuyển tiếp</DialogTitle>
        <DialogContent>
          <List>
            {contacts.map((contact) => (
              <ListItem key={contact.id} onClick={() => handleForwardMessage(contact)}>
                <ListItemAvatar>
                  <Avatar src={contact.avatar}>
                    {contact.isGroup && <BiGroup />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={contact.isGroup ? `[Nhóm] ${contact.name}` : contact.name}
                  secondary={contact.isGroup ? 'Nhóm' : contact.username}
                />
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
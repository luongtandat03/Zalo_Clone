import React, { useEffect, useState, useRef } from 'react';
import { Box, Avatar, Typography, IconButton, TextField, Paper, styled, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText, DialogActions, Button } from '@mui/material';
import { BiSearch, BiPhone, BiVideo, BiDotsVerticalRounded, BiSmile, BiPaperclip, BiSend, BiUndo, BiTrash, BiShare, BiGroup, BiPin } from 'react-icons/bi';
import Picker from 'emoji-picker-react';
import { sendMessage, uploadFile, recallMessage, deleteMessage, forwardMessage, pinMessage, unpinMessage, getPinnedMessages } from '../../api/messageApi';
import { fetchGroupMembers } from '../../api/groupApi';
import SearchMessages from '../../components/SearchMessages';
import FriendModal from './FriendModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.grey[100],
}));

const MessageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSender',
})(({ theme, isSender }) => ({
  display: 'flex',
  justifyContent: isSender ? 'flex-end' : 'flex-start',
  marginBottom: 2,
  padding: '8px 16px',
  alignItems: 'center',
}));

const MessageBubble = styled(Paper)(({ isSender, theme }) => ({
  padding: '8px 16px',
  backgroundColor: isSender ? theme.palette.primary.main : '#ffffff',
  color: isSender ? 'white' : 'black',
  borderRadius: 20,
  position: 'relative',
}));

const PinIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -10,
  right: 10,
  color: theme.palette.warning.main,
}));

const ChatWindow = ({ selectedContact, messages, messageInput, onMessageInputChange, onSendMessage, onProfileOpen, userId, contacts, token }) => {
  const [localMessages, setLocalMessages] = useState(messages);
  const [isSending, setIsSending] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [pinnedMessagesDialogOpen, setPinnedMessagesDialogOpen] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [messageToForward, setMessageToForward] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const handleProfileOpen = () => {
    setProfileData(selectedContact);
    setIsFriendModalOpen(true);
  };

  const handleProfileClose = () => {
    setIsFriendModalOpen(false);
    setProfileData(null);
  };

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
    if (!token) {
      setGroupMembers([]);
      return;
    }

    if (selectedContact?.isGroup) {
      fetchGroupMembers(selectedContact.id, token)
        .then(members => {
          setGroupMembers(members);
        })
        .catch(error => {
          console.error('Error fetching group members:', error);
          setGroupMembers([]);
        });
    } else {
      setGroupMembers([]);
    }
  }, [selectedContact, token]);

  const handleShowPinnedMessages = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để xem tin nhắn đã ghim');
      return;
    }

    try {
      const pinned = await getPinnedMessages(
        selectedContact.isGroup ? userId : selectedContact.id,
        selectedContact.isGroup ? selectedContact.id : null,
        token
      );
      setPinnedMessages(pinned);
      setPinnedMessagesDialogOpen(true);
      toast.success('Đã tải danh sách tin nhắn đã ghim!');
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
      let errorMessage = 'Lỗi tải tin nhắn đã ghim';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Không có quyền truy cập tin nhắn đã ghim. Vui lòng kiểm tra lại quyền truy cập nhóm.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    if (!token) {
      toast.error('Vui lòng đăng nhập để gửi tin nhắn');
      return;
    }

    setIsSending(true);

    const tempKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
          isPinned: false,
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
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiObject) => {
    const newMessageInput = messageInput + emojiObject.emoji;
    onMessageInputChange({ target: { value: newMessageInput } });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    if (!token) {
      toast.error('Vui lòng đăng nhập để gửi file');
      return;
    }
    if (!selectedContact?.id) {
      toast.error('Không tìm thấy ID liên hệ hoặc nhóm');
      return;
    }

    console.log('Uploading files:', {
      isGroup: selectedContact.isGroup,
      id: selectedContact.id,
      files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
    });

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
        } else if (contentType.startsWith('audio/')) {
          type = 'AUDIO';
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
          isPinned: false,
        };
        console.log('Sending message:', message);
        onSendMessage(message);
      });
      toast.success('File đã được gửi!');
    } catch (error) {
      console.error('Error uploading file:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(`Lỗi gửi file: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handlePinMessage = (message) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để ghim tin nhắn');
      return;
    }

    setIsSending(true);
    try {
      const identifier = message.id;
      if (!identifier) {
        throw new Error('Missing message identifier.');
      }
      const success = pinMessage(identifier, userId, token);
      if (success) {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id
              ? { ...msg, isPinned: true }
              : msg
          )
        );
        toast.success('Tin nhắn đã được ghim!');
      } else {
        toast.error('Không thể ghim tin nhắn: WebSocket không hoạt động');
      }
    } catch (error) {
      console.error('Error pinning message:', error);
      toast.error(`Lỗi ghim tin nhắn: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleUnpinMessage = (message) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để bỏ ghim tin nhắn');
      return;
    }

    setIsSending(true);
    try {
      const identifier = message.id;
      if (!identifier) {
        throw new Error('Missing message identifier.');
      }
      const success = unpinMessage(identifier, userId, token);
      if (success) {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id
              ? { ...msg, isPinned: false }
              : msg
          )
        );
        toast.success('Tin nhắn đã được bỏ ghim!');
      } else {
        toast.error('Không thể bỏ ghim tin nhắn: WebSocket không hoạt động');
      }
    } catch (error) {
      console.error('Error unpinning message:', error);
      toast.error(`Lỗi bỏ ghim tin nhắn: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleUnpinFromModal = async (message) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để bỏ ghim tin nhắn');
      return;
    }

    try {
      const success = await unpinMessage(message.id, userId, token);
      if (success) {
        setPinnedMessages((prev) => prev.filter((msg) => msg.id !== message.id));
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, isPinned: false } : msg
          )
        );
        toast.success('Tin nhắn đã được bỏ ghim!');
      } else {
        toast.error('Không thể bỏ ghim tin nhắn: WebSocket không hoạt động');
      }
    } catch (error) {
      console.error('Error unpinning message from modal:', error);
      toast.error(`Lỗi bỏ ghim tin nhắn: ${error.message}`);
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
    if (!contact.id) {
      toast.error('Không tìm thấy ID của liên hệ hoặc nhóm');
      return;
    }

    setIsSending(true);
    try {
      const identifier = messageToForward?.id;
      if (!identifier) {
        throw new Error('Missing message identifier.');
      }
      console.log('Forwarding message:', {
        identifier,
        userId,
        receiverId: contact.isGroup ? null : contact.id,
        groupId: contact.isGroup ? contact.id : null,
        content: messageToForward.content,
        type: messageToForward.type
      });
      const success = forwardMessage(
        identifier,
        userId,
        contact.isGroup ? null : contact.id,
        contact.isGroup ? contact.id : null,
        messageToForward.content,
        token
      );
      if (success) {
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

  const handleSelectMessage = (message) => {
    setPinnedMessagesDialogOpen(false);
    const messageElement = document.getElementById(`message-${message.id}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          onClick={handleProfileOpen}
        >
          {selectedContact.isGroup && <BiGroup />}
        </Avatar>
        <Box
          ml={2}
          flex={1}
          sx={{ cursor: 'pointer' }}
          onClick={handleProfileOpen}
        >
          <Typography variant="subtitle1">{selectedContact.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            {selectedContact.isGroup
              ? `Nhóm (${groupMembers.length} thành viên)`
              : selectedContact.status === 'online' ? 'Online' : 'Offline'}
          </Typography>
        </Box>
        {selectedContact.isGroup ? (
          <>
            <IconButton onClick={() => setShowSearchBar(!showSearchBar)}>
              <BiSearch />
            </IconButton>
            <IconButton onClick={handleShowPinnedMessages}>
              <BiPin />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onProfileOpen({ ...selectedContact, members: groupMembers });
              }}
            >
              <BiDotsVerticalRounded />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton onClick={() => setShowSearchBar(!showSearchBar)}>
              <BiSearch />
            </IconButton>
            <IconButton onClick={handleShowPinnedMessages}>
              <BiPin />
            </IconButton>
            <IconButton>
              <BiPhone />
            </IconButton>
            <IconButton>
              <BiVideo />
            </IconButton>
          </>
        )}
      </Box>

      {showSearchBar && (
        <SearchMessages
          userId={userId}
          selectedContact={selectedContact}
          token={token}
          onSelectMessage={handleSelectMessage}
          onClose={() => setShowSearchBar(false)}
        />
      )}

      <Box flex={1} overflow="auto" p={2} sx={{ bgcolor: '#f0f0f0', position: 'relative' }}>
        {localMessages.map((message, index) => (
          <MessageContainer
            key={message.id ? `${message.id}-${index}` : (message.tempKey ? `${message.tempKey}-${index}` : `${message.createAt}-${message.senderId}-${index}`)}
            isSender={message.senderId === userId}
            id={`message-${message.id}`}
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
                <IconButton
                  size="small"
                  onClick={() => (message.isPinned ? handleUnpinMessage(message) : handlePinMessage(message))}
                  disabled={isSending}
                >
                  <BiPin />
                </IconButton>
              </Box>
            )}
            <MessageBubble isSender={message.senderId === userId}>
              {message.isPinned && (
                <PinIndicator>
                  <BiPin />
                </PinIndicator>
              )}
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
              ) : message.type === 'AUDIO' ? (
                <>
                  {selectedContact.isGroup && message.senderId !== userId && (
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7, mb: 1 }}>
                      {groupMembers.find(m => m.id === message.senderId)?.username || 'Unknown'}
                    </Typography>
                  )}
                  <audio controls style={{ maxWidth: '200px' }}>
                    <source src={message.content} type="audio/mpeg" />
                    <source src={message.content} type="audio/wav" />
                    <source src={message.content} type="audio/ogg" />
                    Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>
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
        <div ref={messagesEndRef} />
      </Box>

      {showEmojiPicker && (
        <Box sx={{ position: 'absolute', bottom: 60, left: 10, zIndex: 1000 }}>
          <Picker onEmojiClick={onEmojiClick} />
        </Box>
      )}

      <Box p={2} borderTop={1} borderColor="divider" sx={{ bgcolor: 'background.paper' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small" onClick={() => setShowEmojiPicker(!showEmojiPicker)} color="primary">
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
              accept="image/*,video/*,audio/*,application/zip,application/x-rar-compressed"
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

      <Dialog open={pinnedMessagesDialogOpen} onClose={() => setPinnedMessagesDialogOpen(false)}>
        <DialogTitle>Tin nhắn đã ghim</DialogTitle>
        <DialogContent>
          {pinnedMessages.length > 0 ? (
            <List>
              {pinnedMessages.map((message) => (
                <ListItem
                  key={message.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleUnpinFromModal(message)}
                      disabled={isSending}
                    >
                      <BiPin />
                    </IconButton>
                  }
                >                  <ListItemText
                    primary={
                      message.type === 'IMAGE' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <img src={message.content} alt="Ảnh" style={{ maxWidth: '100px', maxHeight: '60px', marginRight: '8px' }} />
                          <Typography variant="body2">[Hình ảnh]</Typography>
                        </Box>
                      ) : message.type === 'VIDEO' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <video src={message.content} style={{ maxWidth: '100px', maxHeight: '60px', marginRight: '8px' }} />
                          <Typography variant="body2">[Video]</Typography>
                        </Box>
                      ) : message.type === 'AUDIO' ? (
                        <Typography>[Âm thanh]</Typography>
                      ) : message.type === 'FILE' ? (
                        <Typography>[Tệp đính kèm]</Typography>
                      ) : (
                        message.content
                      )
                    }
                    secondary={`Từ: ${selectedContact.isGroup ? (message.senderId === userId ? 'Bạn' : message.senderId) : message.senderId === userId ? 'Bạn' : selectedContact.name} - ${new Date(message.createAt).toLocaleString()}`}
                    onClick={() => handleSelectMessage(message)}
                    sx={{ cursor: 'pointer' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Không có tin nhắn nào được ghim.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPinnedMessagesDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <FriendModal
        open={isFriendModalOpen}
        onClose={handleProfileClose}
        profileData={profileData}
        userId={userId}
        token={token}
        contacts={contacts}
        onContactSelect={onSendMessage}
      />

      <ToastContainer position="bottom-right" autoClose={3000} />
    </ChatContainer>
  );
};

export default ChatWindow;
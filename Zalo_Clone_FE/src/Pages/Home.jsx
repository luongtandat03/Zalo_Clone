import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ThemeProvider, styled } from "@mui/material/styles";
import { CssBaseline, Box, Typography, IconButton, Menu, MenuItem, Snackbar, Alert } from "@mui/material";
import { BiUserPlus, BiGroup, BiDotsVerticalRounded } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import NavSidebar from "../components/Home/NavSidebar";
import ContactList from "../components/Home/ContactList";
import SettingsPanel from "../components/Home/SettingsPanel";
import ChatWindow from "../components/Home/ChatWindow";
import ProfileModal from "../components/Home/ProfileModal";
import CreateGroupModal from "../components/Home/CreateGroupModal";
import FriendRequestInput from "../components/Home/FriendRequestInput";
import ErrorBoundary from "../components/ErrorBoundary";
import useWebSocket from "../components/hooks/useWebSocket";
import { fetchUserProfile, fetchFriendsList, fetchPendingFriendRequests, acceptFriendRequest } from "../api/user";
import { 
  getChatHistory, 
  getGroupChatHistory, 
  deleteMessage, 
  recallMessage,
  pinMessage,
  unpinMessage,
  sendMessage,
  ensureStompConnection
} from "../api/messageApi";
import { fetchUserGroups } from "../api/groupApi";
import { zaloTheme } from "../theme/theme";
import { addMessageToArray, processChatHistory } from "../components/utils/messageUtils";

const RootContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100vh",
  overflow: "hidden",
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 320,
  borderRight: "1px solid",
  borderColor: theme.palette.divider,
  display: "flex",
  flexDirection: "column",
}));

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token: navToken, userId: navUserId } = location.state || {};
  const [userId, setUserId] = useState(navUserId || localStorage.getItem('userId') || '680e6d95a73e35151128bf65');
  const [token, setToken] = useState(navToken || localStorage.getItem('accessToken'));
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentView, setCurrentView] = useState("messages");
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showAddFriendInput, setShowAddFriendInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupIds, setGroupIds] = useState([]);

  // Helper function to show snackbar messages
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  }, []);

  // Synchronize token with localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken !== token) {
      setToken(storedToken);
    }
  }, [token]);

  // Check token and redirect immediately if no token
  useEffect(() => {
    if (!token) {
      showSnackbar('Vui lòng đăng nhập để sử dụng chức năng!', 'error');
      navigate("/"); // Redirect immediately to login page
      return;
    }
  }, [token, navigate, showSnackbar]);

  // Message handlers for WebSocket
  const handleReceivedMessage = useCallback((receivedMessage) => {
    console.log('Received message in Home:', receivedMessage);
    setMessages(prev => addMessageToArray(prev, receivedMessage));
  }, []);

  const handleDeletedMessage = useCallback((deletedMessage) => {
    console.log('Received delete notification:', deletedMessage);
    if (deletedMessage.id) {
      const deletedMessageIds = JSON.parse(localStorage.getItem('deletedMessageIds') || '[]');
      if (!deletedMessageIds.includes(deletedMessage.id)) {
        deletedMessageIds.push(deletedMessage.id);
        localStorage.setItem('deletedMessageIds', JSON.stringify(deletedMessageIds));
      }
    }
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === deletedMessage.id
          ? { ...msg, deletedByUsers: deletedMessage.deletedByUsers || [] }
          : msg
      )
    );
  }, []);

  const handleRecalledMessage = useCallback((recalledMessage) => {
    console.log('Received recall notification:', recalledMessage);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === recalledMessage.id
          ? { ...msg, recalled: recalledMessage.recalled || false }
          : msg
      )
    );
  }, []);

  const handlePinnedMessage = useCallback((pinnedMessage) => {
    console.log('Received pin notification:', pinnedMessage);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === pinnedMessage.id
          ? { ...msg, isPinned: true }
          : msg
      )
    );
  }, []);

  const handleUnpinnedMessage = useCallback((unpinnedMessage) => {
    console.log('Received unpin notification:', unpinnedMessage);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === unpinnedMessage.id
          ? { ...msg, isPinned: false }
          : msg
      )
    );
  }, []);

  const updateGroups = useCallback(async () => {
    if (!token) return [];
    try {
      const groups = await fetchUserGroups(userId, token);
      const groupContacts = groups.map(group => ({
        id: group.id,
        name: group.name,
        isGroup: true,
        avatar: 'https://example.com/group-icon.png',
        status: 'group',
        lastMessage: group.lastMessage || '',
        timestamp: group.timestamp || 'Yesterday',
      }));
      setContacts(prev => [...prev.filter(c => !c.isGroup), ...groupContacts]);
      const newGroupIds = groups.map(group => group.id).filter(id => id);
      console.log('Group IDs for subscription:', newGroupIds);
      setGroupIds(newGroupIds);
      return newGroupIds;
    } catch (error) {
      showSnackbar('Lỗi tải danh sách nhóm: ' + (error.response?.data?.message || error.message), 'error');
      return [];
    }
  }, [userId, token, showSnackbar]);

  // Delete/Recall message handlers
  const handleDeleteMessage = useCallback((messageId) => {
    if (!token || !userId) {
      showSnackbar('Bạn cần đăng nhập để xóa tin nhắn!', 'error');
      return false;
    }
    
    const result = deleteMessage(messageId, userId, token);
    if (result) {
      showSnackbar('Đã xóa tin nhắn!', 'success');
      
      // Also update the local messages state immediately
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, deletedByUsers: [...(msg.deletedByUsers || []), userId] }
            : msg
        )
      );
    } else {
      showSnackbar('Không thể xóa tin nhắn!', 'error');
    }
    return result;
  }, [token, userId, showSnackbar]);

  const handleRecallMessage = useCallback((messageId) => {
    if (!token || !userId) {
      showSnackbar('Bạn cần đăng nhập để thu hồi tin nhắn!', 'error');
      return false;
    }
    
    const result = recallMessage(messageId, userId, token);
    if (result) {
      showSnackbar('Đã thu hồi tin nhắn!', 'success');
      
      // Also update the local messages state immediately
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, recalled: true }
            : msg
        )
      );
    } else {
      showSnackbar('Không thể thu hồi tin nhắn!', 'error');
    }
    return result;
  }, [token, userId, showSnackbar]);

  const handlePinMessage = useCallback((messageId) => {
    if (!token || !userId) {
      showSnackbar('Bạn cần đăng nhập để ghim tin nhắn!', 'error');
      return false;
    }
    
    const result = pinMessage(messageId, userId, token);
    if (result) {
      showSnackbar('Đã ghim tin nhắn!', 'success');
      
      // Also update the local messages state immediately
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isPinned: true }
            : msg
        )
      );
    } else {
      showSnackbar('Không thể ghim tin nhắn!', 'error');
    }
    return result;
  }, [token, userId, showSnackbar]);

  const handleUnpinMessage = useCallback((messageId) => {
    if (!token || !userId) {
      showSnackbar('Bạn cần đăng nhập để bỏ ghim tin nhắn!', 'error');
      return false;
    }
    
    const result = unpinMessage(messageId, userId, token);
    if (result) {
      showSnackbar('Đã bỏ ghim tin nhắn!', 'success');
      
      // Also update the local messages state immediately
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isPinned: false }
            : msg
        )
      );
    } else {
      showSnackbar('Không thể bỏ ghim tin nhắn!', 'error');
    }
    return result;
  }, [token, userId, showSnackbar]);

  // Function to handle sending messages
  const handleSendMessageToServer = useCallback(async (messageData) => {
    if (!token) {
      showSnackbar('Vui lòng đăng nhập để gửi tin nhắn!', 'error');
      return false;
    }

    try {
      console.log('Sending message from Home component:', messageData);
      
      // Đảm bảo kết nối STOMP trước khi gửi tin nhắn
      const isConnectionReady = await ensureStompConnection(token, userId, groupIds);
      if (!isConnectionReady) {
        showSnackbar('Không thể kết nối đến máy chủ. Đang thử kết nối lại...', 'warning');
        return false;
      }
      
      const destination = '/app/chat.send';
      const success = sendMessage(destination, messageData, token);
      
      if (success) {
        console.log('Message sent successfully');
        return true;
      } else {
        console.error('Failed to send message: WebSocket not connected');
        showSnackbar('Không thể gửi tin nhắn: WebSocket không hoạt động', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar('Lỗi gửi tin nhắn: ' + error.message, 'error');
      return false;
    }
  }, [token, userId, showSnackbar, groupIds]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token) return;

    updateGroups();
  }, [token, updateGroups]);

  // Use our custom WebSocket hook with the actual array of group IDs
  const { isConnected } = useWebSocket(
    token,
    userId,
    groupIds,
    handleReceivedMessage,
    handleDeletedMessage,
    handleRecalledMessage,
    handlePinnedMessage,
    handleUnpinnedMessage
  );

  useEffect(() => {
    if (isConnected) {
      console.log('WebSocket connection established');
    }
  }, [isConnected]);

  useEffect(() => {
    if (profileOpen) {
      fetchUserProfile(token).then((data) => {
        if (data) {
          setUserProfile(data);
        }
      });
    }
  }, [profileOpen, token]);

  const updateFriendsList = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchFriendsList(token);
      if (data) {
        setContacts(prev => [
          ...prev.filter(c => c.isGroup),
          ...data.map(friend => ({
            id: friend.id,
            name: friend.name,
            username: friend.name,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
            status: friend.status || "offline",
            lastMessage: friend.lastMessage || "",
            unreadCount: friend.unreadCount || 0,
            timestamp: friend.timestamp || "Yesterday",
          })),
        ]);
      } else {
        showSnackbar("Không thể tải danh sách bạn bè!", "error");
      }
    } catch (error) {
      showSnackbar("Lỗi tải danh sách bạn bè: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setIsLoading(false);
    }
  }, [token, showSnackbar]);

  const updatePendingRequests = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchPendingFriendRequests(token);
      if (data) {
        setPendingRequests(data.map(request => ({
          id: request.id,
          name: request.name,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
        })));
      } else {
        showSnackbar("Không thể tải danh sách lời mời!", "error");
      }
    } catch (error) {
      showSnackbar("Lỗi tải danh sách lời mời: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setIsLoading(false);
    }
  }, [token, showSnackbar]);

  useEffect(() => {
    if (currentView === "contacts" || currentView === "messages") {
      updateFriendsList();
      updateGroups();
    }
  }, [currentView, updateFriendsList, updateGroups]);

  useEffect(() => {
    if (!selectedContact || !token || !selectedContact.id) return;

    const loadChatHistory = async () => {
      try {
        let chatHistory;
        if (selectedContact.isGroup) {
          chatHistory = await getGroupChatHistory(selectedContact.id, token);
        } else {
          chatHistory = await getChatHistory(selectedContact.id, token);
        }
        console.log('Chat history loaded:', chatHistory);
        const uniqueMessages = processChatHistory(chatHistory);
        setMessages(uniqueMessages);
      } catch (error) {
        showSnackbar("Lỗi tải lịch sử tin nhắn: " + (error.response?.data?.message || error.message), "error");
      }
    };
    loadChatHistory();
  }, [selectedContact, token, showSnackbar]);

  const handleSendMessage = useCallback((message) => {
    console.log('Sending message:', message);
    setMessages((prev) => {
      if (!message.content && !message.type) {
        return prev.map((msg) =>
          msg.id === message.id
            ? { ...msg, ...message }
            : msg
        );
      }

      const deletedMessageIds = JSON.parse(localStorage.getItem('deletedMessageIds') || '[]');
      if (message.id && deletedMessageIds.includes(message.id)) {
        return prev;
      }

      return [...prev, message];
    });
  }, []);

  const handleProfileOpen = useCallback((user) => {
    setSelectedProfile(user);
    setProfileOpen(true);
  }, []);

  const handleProfileClose = useCallback(() => {
    setProfileOpen(false);
    setSelectedProfile(null);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("deletedMessageIds");
    setUserId(null);
    setToken(null);
    showSnackbar("Đăng xuất thành công!", "success");
    handleMenuClose();
    navigate("/");
  }, [navigate, showSnackbar]);

  const handleToggleAddFriendInput = useCallback(() => {
    setShowAddFriendInput(!showAddFriendInput);
  }, [showAddFriendInput]);

  const handleAcceptFriendRequest = useCallback(async (userId) => {
    if (!token) {
      showSnackbar("Vui lòng đăng nhập để chấp nhận lời mời kết bạn!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const result = await acceptFriendRequest(userId, token);
      if (result) {
        showSnackbar("Đã chấp nhận lời mời kết bạn!", "success");
        await updateFriendsList();
        await updatePendingRequests();
      } else {
        showSnackbar("Chấp nhận lời mời thất bại!", "error");
      }
    } catch (error) {
      showSnackbar("Lỗi chấp nhận lời mời: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setIsLoading(false);
    }
  }, [updateFriendsList, updatePendingRequests, token, showSnackbar]);

  const handleOpenCreateGroup = () => {
    setCreateGroupOpen(true);
    handleMenuClose();
  };

  const chatWindowProps = useMemo(() => ({
    selectedContact,
    messages,
    messageInput,
    onMessageInputChange: (e) => setMessageInput(e.target.value),
    onSendMessage: handleSendMessage,
    onSendMessageToServer: handleSendMessageToServer,
    onProfileOpen: handleProfileOpen,
    onDeleteMessage: handleDeleteMessage,
    onRecallMessage: handleRecallMessage,
    onPinMessage: handlePinMessage,
    onUnpinMessage: handleUnpinMessage,
    userId,
    contacts,
    token,
    isWebSocketConnected: isConnected,
  }), [
    selectedContact, 
    messages, 
    messageInput, 
    handleSendMessage, 
    handleSendMessageToServer,
    handleProfileOpen, 
    handleDeleteMessage, 
    handleRecallMessage,
    handlePinMessage,
    handleUnpinMessage,
    userId, 
    contacts, 
    token,
    isConnected
  ]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={zaloTheme}>
        <CssBaseline />
        <RootContainer>
          <NavSidebar
            userProfile={userProfile}
            currentView={currentView}
            onViewChange={setCurrentView}
            onProfileOpen={() => handleProfileOpen({ id: userId, name: userProfile?.name || "User" })}
            onLogout={handleLogout}
          />
          <SidebarContainer>
            <Box p={2} display="flex" flexDirection="column">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  {currentView === "messages"
                    ? "Zalo Mess"
                    : currentView === "contacts"
                      ? "Contacts"
                      : "Settings"}
                </Typography>
                <Box>
                  <IconButton onClick={handleToggleAddFriendInput} sx={{ mr: 1 }} disabled={isLoading}>
                    <BiUserPlus title="Add Friend" />
                  </IconButton>
                  <IconButton onClick={handleOpenCreateGroup} sx={{ mr: 1 }} disabled={isLoading}>
                    <BiGroup title="Create Group" />
                  </IconButton>
                  <IconButton onClick={handleMenuOpen} disabled={isLoading}>
                    <BiDotsVerticalRounded />
                  </IconButton>
                </Box>
              </Box>
              {showAddFriendInput && (
                <FriendRequestInput
                  token={token}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  showSnackbar={showSnackbar}
                  onSuccess={() => {
                    updateFriendsList();
                    updatePendingRequests();
                  }}
                />
              )}
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleOpenCreateGroup}>Tạo nhóm</MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={2000}
              onClose={() => setOpenSnackbar(false)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
            {(currentView === "messages" || currentView === "contacts") && (
              <ContactList
                contacts={contacts}
                selectedContact={selectedContact}
                onContactSelect={setSelectedContact}
                pendingRequests={pendingRequests}
                onAcceptFriendRequest={handleAcceptFriendRequest}
                isLoading={isLoading}
              />
            )}
            {currentView === "settings" && <SettingsPanel />}
          </SidebarContainer>
          {token ? (
            <ChatWindow {...chatWindowProps} />
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
              <Typography variant="h6" color="text.secondary">
                Vui lòng đăng nhập để sử dụng chức năng chat
              </Typography>
            </Box>
          )}
          <ProfileModal
            open={profileOpen}
            onClose={handleProfileClose}
            profileData={selectedProfile}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            sx={{ backgroundColor: "#0068ff" }}
          />
          <CreateGroupModal
            open={createGroupOpen}
            onClose={() => setCreateGroupOpen(false)}
            contacts={contacts}
            token={token}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            showSnackbar={showSnackbar}
            onSuccess={updateGroups}
          />
        </RootContainer>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default Home;
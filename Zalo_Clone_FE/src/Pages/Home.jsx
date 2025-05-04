import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ThemeProvider, styled, createTheme } from "@mui/material/styles";
import { CssBaseline, TextField } from '@mui/material';  
import { Box, Typography, IconButton, Menu, MenuItem, Snackbar, Alert } from "@mui/material";
import { BiUserPlus, BiGroup, BiDotsVerticalRounded } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import NavSidebar from "../components/Home/NavSidebar";
import ContactList from "../components/Home/ContactList";
import SettingsPanel from "../components/Home/SettingsPanel";
import ChatWindow from "../components/Home/ChatWindow";
import ProfileModal from "../components/Home/ProfileModal";
import { fetchUserProfile, fetchFriendsList, sendFriendRequest, fetchPendingFriendRequests, acceptFriendRequest } from "../api/user";
import { getChatHistory, connectWebSocket, disconnectWebSocket } from "../api/messageApi";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0088cc",
      light: "#35a3e0",
      dark: "#006699",
    },
    secondary: {
      main: "#0068ff",
      light: "#339aff",
      dark: "#004bb5",
    },
  },
});

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
  const [friendIdInput, setFriendIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId') || '680e6d95a73e35151128bf65';
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    console.log('Home mounted with userId:', userId);
    if (profileOpen) {
      fetchUserProfile(token).then((data) => {
        if (data) setUserProfile(data);
      });
    }
    return () => {
      console.log('Home unmounting');
    };
  }, [profileOpen, token]);

  useEffect(() => {
    if (!token) return;

    connectWebSocket(
      token,
      userId,
      (receivedMessage) => {
        console.log('Received message in Home:', receivedMessage);
        setMessages((prev) => {
          const messageExists = prev.some(msg => 
            (msg.id && msg.id === receivedMessage.id) || 
            (msg.tempId && msg.tempId === receivedMessage.tempId)
          );
          if (messageExists) {
            return prev.map((msg) =>
              (msg.id && msg.id === receivedMessage.id) || 
              (msg.tempId && msg.tempId === receivedMessage.tempId)
                ? { ...msg, ...receivedMessage }
                : msg
            );
          }
          const deletedMessageIds = JSON.parse(localStorage.getItem('deletedMessageIds') || '[]');
          if (receivedMessage.id && deletedMessageIds.includes(receivedMessage.id)) {
            return prev;
          }
          return [...prev, {
            ...receivedMessage,
            createAt: new Date(receivedMessage.createAt).toISOString(),
            recalled: receivedMessage.recalled || false,
            deletedByUsers: receivedMessage.deletedByUsers || [],
            isRead: receivedMessage.isRead || false,
          }];
        });
      },
      (deletedMessage) => {
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
            (msg.id && msg.id === deletedMessage.id) || 
            (msg.tempId && msg.tempId === deletedMessage.tempId)
              ? { ...msg, deletedByUsers: deletedMessage.deletedByUsers || [] }
              : msg
          )
        );
      },
      (recalledMessage) => {
        console.log('Received recall notification:', recalledMessage);
        setMessages((prev) =>
          prev.map((msg) =>
            (msg.id && msg.id === recalledMessage.id) || 
            (msg.tempId && msg.tempId === recalledMessage.tempId)
              ? { ...msg, recalled: recalledMessage.recalled || false }
              : msg
          )
        );
      }
    )
      .then(() => {
        console.log('STOMP connected in Home');
      })
      .catch((error) => {
        console.error('Failed to connect STOMP in Home:', error);
        setSnackbarMessage(`Không thể kết nối WebSocket: ${error.message}`);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      });

    return () => {
      disconnectWebSocket();
    };
  }, [token, userId]);

  const updateFriendsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchFriendsList(token);
      if (data) {
        setContacts(data.map(friend => ({
          id: friend.id,
          name: friend.name,
          username: friend.name,
          avatar: friend.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
          status: friend.status || "offline",
          lastMessage: friend.lastMessage || "",
          unreadCount: friend.unreadCount || 0,
          timestamp: friend.timestamp || "Yesterday",
        })));
      } else {
        setSnackbarMessage("Không thể tải danh sách bạn bè!");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage("Lỗi tải danh sách bạn bè: " + error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updatePendingRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPendingFriendRequests(token);
      if (data) {
        setPendingRequests(data.map(request => ({
          id: request.id,
          name: request.name,
          avatar: request.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
        })));
      } else {
        setSnackbarMessage("Không thể tải danh sách lời mời!");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage("Lỗi tải danh sách lời mời: " + error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (currentView === "contacts" || currentView === "messages") {
      updateFriendsList();
      updatePendingRequests();
    }
  }, [currentView, updateFriendsList, updatePendingRequests]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!selectedContact || !token) return;
      try {
        const chatHistory = await getChatHistory(selectedContact.id, token);
        console.log('Chat history loaded:', chatHistory);
        setMessages(chatHistory.map(msg => {
          let createAt = msg.createdAt;
          try {
            if (typeof createAt === 'string' && !createAt.endsWith('Z') && !createAt.includes('+')) {
              createAt = `${createAt}Z`;
            }
            const date = new Date(createAt);
            if (isNaN(date.getTime())) {
              throw new Error('Invalid date');
            }
            return {
              id: msg.id,
              senderId: msg.senderId,
              receiverId: msg.receiverId,
              content: msg.content,
              type: msg.type,
              createAt: date.toISOString(),
              recalled: msg.recalled || false,
              deletedByUsers: msg.deletedByUsers || [],
              isRead: msg.isRead || false,
            };
          } catch (error) {
            console.error('Error parsing date for message:', msg, error);
            return {
              id: msg.id,
              senderId: msg.senderId,
              receiverId: msg.receiverId,
              content: msg.content,
              type: msg.type,
              createAt: new Date().toISOString(),
              recalled: msg.recalled || false,
              deletedByUsers: msg.deletedByUsers || [],
              isRead: msg.isRead || false,
            };
          }
        }));
      } catch (error) {
        setSnackbarMessage("Lỗi tải lịch sử tin nhắn: " + error.message);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    };
    loadChatHistory();
  }, [selectedContact, token]);

  const handleSendMessage = useCallback((message) => {
    console.log('Sending message:', message);
    setMessages((prev) => {
      const messageExists = prev.some(msg => 
        (msg.id && msg.id === message.id) || 
        (msg.tempId && msg.tempId === message.tempId)
      );
      if (messageExists) {
        if (message.recalled || message.deletedByUsers) {
          return prev.map((msg) =>
            (msg.id && msg.id === message.id) || 
            (msg.tempId && msg.tempId === message.tempId)
              ? { ...msg, recalled: message.recalled, deletedByUsers: message.deletedByUsers }
              : msg
          );
        }
        return prev;
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
    setSnackbarMessage("Đăng xuất thành công!");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
    handleMenuClose();
    setTimeout(() => {
      navigate("/");
    }, 1000);
  }, [navigate]);

  const handleToggleAddFriendInput = useCallback(() => {
    setShowAddFriendInput(!showAddFriendInput);
    setFriendIdInput("");
  }, [showAddFriendInput]);

  const handleSendFriendRequest = useCallback(async () => {
    if (!friendIdInput.trim()) {
      setSnackbarMessage("Vui lòng nhập ID người dùng!");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendFriendRequest(friendIdInput, token);
      if (result) {
        setSnackbarMessage("Gửi lời mời kết bạn thành công!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        setShowAddFriendInput(false);
        setFriendIdInput("");
        await updateFriendsList();
        await updatePendingRequests();
      } else {
        setSnackbarMessage("Gửi lời mời kết bạn thất bại!");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage("Lỗi gửi lời mời kết bạn: " + error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [friendIdInput, updateFriendsList, updatePendingRequests, token]);

  const handleAcceptFriendRequest = useCallback(async (userId) => {
    setIsLoading(true);
    try {
      const result = await acceptFriendRequest(userId, token);
      if (result) {
        setSnackbarMessage("Đã chấp nhận lời mời kết bạn!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        await updateFriendsList();
        await updatePendingRequests();
      } else {
        setSnackbarMessage("Chấp nhận lời mời thất bại!");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage("Lỗi chấp nhận lời mời: " + error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [updateFriendsList, updatePendingRequests, token]);

  const chatWindowProps = useMemo(() => ({
    selectedContact,
    messages,
    messageInput,
    onMessageInputChange: (e) => setMessageInput(e.target.value),
    onSendMessage: handleSendMessage,
    onProfileOpen: handleProfileOpen,
    userId,
    contacts
  }), [selectedContact, messages, messageInput, handleSendMessage, handleProfileOpen, userId, contacts]);

  return (
    <ThemeProvider theme={theme}>
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
                <IconButton onClick={handleMenuOpen} sx={{ mr: 1 }} disabled={isLoading}>
                  <BiGroup title="Create Group" />
                </IconButton>
                <IconButton onClick={handleMenuOpen} disabled={isLoading}>
                  <BiDotsVerticalRounded />
                </IconButton>
              </Box>
            </Box>

            {showAddFriendInput && (
              <Box mt={2} display="flex" alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Nhập ID người dùng"
                  variant="outlined"
                  size="small"
                  value={friendIdInput}
                  onChange={(e) => setFriendIdInput(e.target.value)}
                  disabled={isLoading}
                />
                <IconButton color="primary" onClick={handleSendFriendRequest} disabled={isLoading}>
                  <Typography variant="button">Gửi</Typography>
                </IconButton>
              </Box>
            )}
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Tạo nhóm</MenuItem>
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

          {currentView === "messages" && (
            <ContactList
              contacts={contacts}
              selectedContact={selectedContact}
              onContactSelect={setSelectedContact}
              pendingRequests={pendingRequests}
              onAcceptFriendRequest={handleAcceptFriendRequest}
              isLoading={isLoading}
            />
          )}
          {currentView === "contacts" && (
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

        <ChatWindow {...chatWindowProps} />

        <ProfileModal
          open={profileOpen}
          onClose={handleProfileClose}
          profileData={selectedProfile}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          sx={{ backgroundColor: "#0068ff" }}
        />
      </RootContainer>
    </ThemeProvider>
  );
};

export default Home;
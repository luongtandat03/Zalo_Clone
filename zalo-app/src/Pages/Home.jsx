import React, { useState, useEffect } from "react";
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

const mockMessages = [
  {
    id: 1,
    senderId: 1,
    text: "Hey there!",
    timestamp: "10:30 AM",
    status: "read",
  },
  {
    id: 2,
    senderId: 2,
    text: "Hi! How are you?",
    timestamp: "10:31 AM",
    status: "read",
  },
];

const mockUser = {
  id: 1,
  name: "Current User",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
  status: "online",
  dateOfBirth: "1990-01-01",
  gender: "Male",
  phone: "+1234567890",
};

const Home = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState(mockMessages);
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
  const [showAddFriendInput, setShowAddFriendInput] = useState(false);
  const [friendIdInput, setFriendIdInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (profileOpen) {
      fetchUserProfile().then((data) => {
        if (data) setUserProfile(data);
      });
    }
  }, [profileOpen]);

  // Lấy danh sách bạn bè và lời mời khi chuyển sang view "contacts" hoặc "messages"
  const updateFriendsList = async () => {
    const data = await fetchFriendsList();
    if (data) {
      setContacts(data.map(friend => ({
        id: friend.id,
        name: friend.name,
        avatar: friend.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
        status: friend.status || "offline",
        lastMessage: friend.lastMessage || "",
        unreadCount: friend.unreadCount || 0,
        timestamp: friend.timestamp || "Yesterday",
      })));
    }
  };

  const updatePendingRequests = async () => {
    const data = await fetchPendingFriendRequests();
    if (data) {
      setPendingRequests(data.map(request => ({
        id: request.id,
        name: request.name,
        avatar: request.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      })));
    }
  };

  useEffect(() => {
    if (currentView === "contacts" || currentView === "messages") {
      updateFriendsList();
      updatePendingRequests();
    }
  }, [currentView]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      senderId: mockUser.id,
      text: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  const handleProfileOpen = (user) => {
    setSelectedProfile(user);
    setProfileOpen(true);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
    setSelectedProfile(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setSnackbarMessage("Đăng xuất thành công!");
    setOpenSnackbar(true);
    handleMenuClose();
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleToggleAddFriendInput = () => {
    setShowAddFriendInput(!showAddFriendInput);
    setFriendIdInput("");
  };

  const handleSendFriendRequest = async () => {
    if (!friendIdInput.trim()) {
      setSnackbarMessage("Vui lòng nhập ID người dùng!");
      setOpenSnackbar(true);
      return;
    }

    const result = await sendFriendRequest(friendIdInput);
    if (result) {
      setSnackbarMessage("Gửi lời mời kết bạn thành công!");
      setOpenSnackbar(true);
      setShowAddFriendInput(false);
      setFriendIdInput("");
      await updateFriendsList(); // Cập nhật danh sách bạn bè
      await updatePendingRequests(); // Cập nhật danh sách lời mời
    } else {
      setSnackbarMessage("Gửi lời mời kết bạn thất bại!");
      setOpenSnackbar(true);
    }
  };

  const handleAcceptFriendRequest = async (userId) => {
    const result = await acceptFriendRequest(userId);
    if (result) {
      setSnackbarMessage("Đã chấp nhận lời mời kết bạn!");
      setOpenSnackbar(true);
      await updateFriendsList(); // Cập nhật danh sách bạn bè
      await updatePendingRequests(); // Cập nhật danh sách lời mời
    } else {
      setSnackbarMessage("Chấp nhận lời mời thất bại!");
      setOpenSnackbar(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RootContainer>
        <NavSidebar 
          userProfile={userProfile}
          currentView={currentView}
          onViewChange={setCurrentView}
          onProfileOpen={() => handleProfileOpen(mockUser)}
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
                <IconButton onClick={handleToggleAddFriendInput} sx={{ mr: 1 }}>
                  <BiUserPlus title="Add Friend" />
                </IconButton>
                <IconButton onClick={handleMenuOpen} sx={{ mr: 1 }}>
                  <BiGroup title="Create Group" />
                </IconButton>
                <IconButton onClick={handleMenuOpen}>
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
                />
                <IconButton color="primary" onClick={handleSendFriendRequest}>
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
            <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarMessage.includes("thành công") ? "success" : "error"} sx={{ width: "100%" }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>

          {currentView === "messages" && (
            <ContactList
              contacts={contacts}
              selectedContact={selectedContact}
              onContactSelect={setSelectedContact}
              onUpdateFriendsList={updateFriendsList}
              pendingRequests={pendingRequests}
              onAcceptFriendRequest={handleAcceptFriendRequest}
            />
          )}
          {currentView === "contacts" && (
            <ContactList
              contacts={contacts}
              selectedContact={selectedContact}
              onContactSelect={setSelectedContact}
              onUpdateFriendsList={updateFriendsList}
              pendingRequests={pendingRequests}
              onAcceptFriendRequest={handleAcceptFriendRequest}
            />
          )}
          {currentView === "settings" && <SettingsPanel />}
        </SidebarContainer>

        <ChatWindow
          selectedContact={selectedContact}
          messages={messages}
          messageInput={messageInput}
          onMessageInputChange={(e) => setMessageInput(e.target.value)}
          onSendMessage={handleSendMessage}
          onProfileOpen={handleProfileOpen}
          userId={mockUser.id}
        />

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
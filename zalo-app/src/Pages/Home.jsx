import React, { useState, useEffect } from "react";
import { ThemeProvider, styled ,createTheme } from "@mui/material/styles";
import { CssBaseline } from '@mui/material';  
import { Box, Typography, IconButton, Menu, MenuItem, Snackbar, Alert } from "@mui/material";
import { BiUserPlus, BiGroup, BiDotsVerticalRounded } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import NavSidebar from "../components/Home/NavSidebar";
import ContactList from "../components/Home/ContactList";
import SettingsPanel from "../components/Home/SettingsPanel";
import ChatWindow from "../components/Home/ChatWindow";
import ProfileModal from "../components/Home/ProfileModal";
import { fetchUserProfile } from "../api/user";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0088cc",
      light: "#35a3e0",
      dark: "#006699",
    },
    secondary: {
      main: "#0068ff",     // đổi luôn màu chủ đạo nếu muốn
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
const mockContacts = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    status: "online",
    lastMessage: "Hey, how are you?",
    unreadCount: 2,
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    status: "offline",
    lastMessage: "See you tomorrow!",
    unreadCount: 0,
    timestamp: "Yesterday",
  },
];

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
  const [, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profileOpen) {
      fetchUserProfile().then((data) => {
        if (data) setUserProfile(data);
      });
    }
  }, [profileOpen]);

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

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setOpenSnackbar(true);
    handleMenuClose();
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RootContainer >
        <NavSidebar 
          userProfile={userProfile}
          currentView={currentView}
          onViewChange={setCurrentView}
          onProfileOpen={() => handleProfileOpen(mockUser)}
          onLogout={handleLogout}
        />

        <SidebarContainer >
          <Box p={2} display="flex" alignItems="center" justifyContent="space-between"  >
            <Typography variant="h6">
              {currentView === "messages"
                ? "Zalo Mess"
                : currentView === "contacts"
                ? "Contacts"
                : "Settings"}
            </Typography>
            <Box>
              <IconButton onClick={() => setAnchorEl(null)} sx={{ mr: 1 }}>
                <BiUserPlus title="Add Friend" />
              </IconButton>
              <IconButton onClick={() => setAnchorEl(null)} sx={{ mr: 1 }}>
                <BiGroup title="Create Group" />
              </IconButton>
            </Box>

            <Snackbar
              open={openSnackbar}
              autoHideDuration={2000}
              onClose={() => setOpenSnackbar(false)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: "100%" }}>
                Đăng xuất thành công!
              </Alert>
            </Snackbar>
          </Box>

          {currentView === "messages" && (
            <ContactList
              contacts={mockContacts}
              selectedContact={selectedContact}
              onContactSelect={setSelectedContact}
            />
          )}
          {currentView === "contacts" && (
            <ContactList
              contacts={mockContacts}
              selectedContact={selectedContact}
              onContactSelect={setSelectedContact}
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
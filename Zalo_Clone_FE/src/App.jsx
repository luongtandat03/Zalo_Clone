import React, { useState } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import NavSidebar from "./components/NavSidebar";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0088cc",
      light: "#35a3e0",
      dark: "#006699"
    },
    secondary: {
      main: "#f5f5f5",
      light: "#ffffff",
      dark: "#e0e0e0"
    }
  }
});

const mockUser = {
  id: 1,
  name: "Current User",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
  status: "online"
};

const App = () => {
  const [currentView, setCurrentView] = useState("messages");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <NavSidebar currentView={currentView} setCurrentView={setCurrentView} user={mockUser} />
      </Box>
    </ThemeProvider>
  );
};

export default App;

import React from "react";
import { Box, Avatar, IconButton } from "@mui/material";
import { BiMessageSquareDetail, BiUser, BiCog } from "react-icons/bi";
import { styled } from "@mui/material/styles";

const NavSidebarContainer = styled(Box)(({ theme }) => ({
  width: 70,
  borderRight: "1px solid",
  borderColor: theme.palette.divider,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(2),
  bgcolor: "#0088cc",
  color: "white",
}));

const NavSidebar = ({ userProfile, currentView, onViewChange, onProfileOpen }) => {
  return (
    <NavSidebarContainer>
      <Avatar
        src={userProfile?.avatar || ""}
        sx={{
          mb: 3,
          cursor: "pointer",
          bgcolor: !userProfile?.avatar ? "#ffffff30" : "transparent",
        }}
        onClick={onProfileOpen}
      />
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center" }}>
        <IconButton
          sx={{ mb: 2, color: currentView === "messages" ? "#ffffff" : "rgba(255,255,255,0.7)" }}
          onClick={() => onViewChange("messages")}
        >
          <BiMessageSquareDetail />
        </IconButton>
        <IconButton
          sx={{ mb: 2, color: currentView === "contacts" ? "#ffffff" : "rgba(255,255,255,0.7)" }}
          onClick={() => onViewChange("contacts")}
        >
          <BiUser />
        </IconButton>
        <Box sx={{ mt: "auto" }}>
          <IconButton
            sx={{ color: currentView === "settings" ? "#ffffff" : "rgba(255,255,255,0.7)" }}
            onClick={() => onViewChange("settings")}
          >
            <BiCog />
          </IconButton>
        </Box>
      </Box>
    </NavSidebarContainer>
  );
};

export default NavSidebar;
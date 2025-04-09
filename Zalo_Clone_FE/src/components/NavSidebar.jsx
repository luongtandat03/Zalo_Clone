import React from "react";
import { Box, Avatar, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { BiMessageSquareDetail, BiUser, BiCog } from "react-icons/bi";

const NavSidebarRoot = styled(Box)(({ theme }) => ({
  width: 70,
  borderRight: "1px solid",
  borderColor: theme.palette.divider,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(2)
}));

const NavSidebar = ({ currentView, setCurrentView, user }) => {
  return (
    <NavSidebarRoot>
      <Avatar src={user?.avatar} sx={{ mb: 3 }} />
      <IconButton
        color={currentView === "messages" ? "primary" : "default"}
        onClick={() => setCurrentView("messages")}
        sx={{ mb: 2 }}
      >
        <BiMessageSquareDetail />
      </IconButton>
      <IconButton
        color={currentView === "contacts" ? "primary" : "default"}
        onClick={() => setCurrentView("contacts")}
        sx={{ mb: 2 }}
      >
        <BiUser />
      </IconButton>
      <IconButton
        color={currentView === "settings" ? "primary" : "default"}
        onClick={() => setCurrentView("settings")}
        sx={{ mb: 2 }}
      >
        <BiCog />
      </IconButton>
    </NavSidebarRoot>
  );
};

export default NavSidebar;

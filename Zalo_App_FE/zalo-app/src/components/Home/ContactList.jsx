import React from "react";
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Badge, TextField, InputAdornment } from "@mui/material";
import { BiSearch } from "react-icons/bi";

const ContactList = ({ contacts, selectedContact, onContactSelect }) => {
  return (
    <>
      <TextField
        fullWidth
        placeholder="Search contacts"
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <BiSearch />
            </InputAdornment>
          ),
        }}
      />
      <List sx={{ overflow: "auto", flex: 1 }}>
        {contacts.map((contact) => (
          <ListItem
            key={contact.id}
            button
            selected={selectedContact?.id === contact.id}
            onClick={() => onContactSelect(contact)}
          >
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                color={contact.status === "online" ? "success" : "error"}
              >
                <Avatar src={contact.avatar} />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={contact.name}
              secondary={contact.lastMessage}
              secondaryTypographyProps={{ noWrap: true }}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default ContactList;
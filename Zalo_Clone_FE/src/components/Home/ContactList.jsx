import React, { useState } from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Box, Button } from '@mui/material';
import SearchBar from '../../components/SearchBar'; // Import SearchBar để tìm kiếm liên hệ

const ContactList = ({ contacts, selectedContact, onContactSelect, pendingRequests, onAcceptFriendRequest, isLoading }) => {
  const [filteredContacts, setFilteredContacts] = useState(contacts);

  // Hàm tìm kiếm liên hệ
  const handleSearchContacts = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter((contact) =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold' }}>
        Danh sách liên hệ
      </Typography>
      <SearchBar
        placeholder="Tìm kiếm liên hệ..."
        onSearch={handleSearchContacts}
      />
      <List>
        {filteredContacts.map((contact) => (
          <ListItem
            key={contact.id}
            button
            selected={selectedContact?.id === contact.id}
            onClick={() => onContactSelect(contact)}
          >
            <ListItemAvatar>
              <Avatar src={contact.avatar} />
            </ListItemAvatar>
            <ListItemText
              primary={contact.name}
              secondary={
                <>
                  <Typography variant="body2" color="textSecondary">
                    {contact.lastMessage}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {contact.timestamp}
                  </Typography>
                </>
              }
            />
            {contact.unreadCount > 0 && (
              <Box sx={{ ml: 2, bgcolor: 'primary.main', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="white">
                  {contact.unreadCount}
                </Typography>
              </Box>
            )}
          </ListItem>
        ))}
      </List>
      {pendingRequests.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold' }}>
            Lời mời kết bạn
          </Typography>
          <List>
            {pendingRequests.map((request) => (
              <ListItem key={request.id}>
                <ListItemAvatar>
                  <Avatar src={request.avatar} />
                </ListItemAvatar>
                <ListItemText primary={request.name} />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onAcceptFriendRequest(request.id)}
                  disabled={isLoading}
                >
                  Chấp nhận
                </Button>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

export default ContactList;
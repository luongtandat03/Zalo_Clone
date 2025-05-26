import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Typography, Snackbar, Alert
} from '@mui/material';

import {
  addGroupMembers,
  removeGroupMember,
  fetchGroupMembers,
  assignGroupRole,
  fetchEligibleFriends
} from '../../api/groupApi';

const SettingGroup = ({ open, onClose, groupId, token }) => {
  const [members, setMembers] = useState([]);
  const [eligibleFriends, setEligibleFriends] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (open) {
      loadMembers();
      loadEligibleFriends();
    }
  }, [open]);

  const loadMembers = async () => {
    try {
      const fetchedMembers = await fetchGroupMembers(groupId, token);
      setMembers(fetchedMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const loadEligibleFriends = async () => {
    try {
      const fetchedFriends = await fetchEligibleFriends(groupId, token);
      setEligibleFriends(fetchedFriends);
    } catch (error) {
      console.error('Failed to fetch eligible friends:', error);
    }
  };

  const handleAddFriendToGroup = async (friendId) => {
    try {
      await addGroupMembers(groupId, [friendId], token);
      await assignGroupRole(groupId, friendId, 'MEMBER', token);
      setSnackbarMessage('Thêm thành viên thành công!');
      setSnackbarSeverity('success');
      loadMembers();
      loadEligibleFriends(); // cập nhật lại danh sách bạn bè còn lại
    } catch (error) {
      console.error('Failed to add friend:', error);
      setSnackbarMessage('Không thể thêm thành viên.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeGroupMember(groupId, userId, token);
      loadMembers();
      loadEligibleFriends();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Quản lý nhóm</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>Thành viên hiện tại:</Typography>
        <List dense>
          {members.map((member) => (
            <ListItem
              key={member.id}
              secondaryAction={
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  Xóa
                </Button>
              }
            >
              <ListItemAvatar>
                <Avatar src={member.avatar || '/default-avatar.png'} />
              </ListItemAvatar>
              <ListItemText
                primary={`${member.firstName} ${member.lastName}`}
                secondary={member.phone}
              />
            </ListItem>
          ))}
        </List>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Thêm từ danh sách bạn bè:</Typography>
        <List dense>
          {eligibleFriends.length === 0 && (
            <Typography variant="body2" color="textSecondary">Không còn bạn bè nào để thêm.</Typography>
          )}
          {eligibleFriends.map((friend) => (
            <ListItem
              key={friend.id}
              secondaryAction={
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAddFriendToGroup(friend.id)}
                >
                  Thêm
                </Button>
              }
            >
              <ListItemAvatar>
                <Avatar src={friend.avatar || '/default-avatar.png'} />
              </ListItemAvatar>
              <ListItemText
                primary={`${friend.firstName} ${friend.lastName}`}
                secondary={friend.phone}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">Đóng</Button>
      </DialogActions>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default SettingGroup;

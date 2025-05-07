import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Typography, TextField, Snackbar, Alert
} from '@mui/material';

import {
  addGroupMembers,
  removeGroupMember,
  fetchGroupMembers,
  assignGroupRole
} from '../../api/groupApi'; // chỉnh lại nếu cần

const SettingGroup = ({ open, onClose, groupId, token }) => {
  const [members, setMembers] = useState([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (open) {
      loadMembers();
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

  const handleAddMember = async () => {
    if (!newMemberId.trim()) return;
    try {
      await addGroupMembers(groupId, [newMemberId], token);
      await assignGroupRole(groupId, newMemberId, 'MEMBER', token); // gán role MEMBER
      setNewMemberId('');
      loadMembers();
      setSnackbarMessage('Thêm thành viên và gán quyền thành công!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Failed to add or assign role:', error);
      setSnackbarMessage('Không thể thêm thành viên hoặc gán quyền.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeGroupMember(groupId, userId, token);
      loadMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Quản lý nhóm</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>Thành viên:</Typography>
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
                primary={member.name}
                secondary={`@${member.username}`}
              />
            </ListItem>
          ))}
        </List>

        <TextField
          label="Nhập ID thành viên"
          variant="outlined"
          fullWidth
          value={newMemberId}
          onChange={(e) => setNewMemberId(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 1, backgroundColor: "#2ecc71", ":hover": { backgroundColor: "#27ae60" } }}
          onClick={handleAddMember}
        >
          Thêm thành viên
        </Button>
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

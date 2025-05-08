import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { createGroup } from "../../api/groupApi";

const CreateGroupModal = ({ 
  open, 
  onClose, 
  contacts, 
  token, 
  onSuccess,
  isLoading,
  setIsLoading,
  showSnackbar
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMemberIds.length === 0) {
      showSnackbar('Vui lòng nhập tên nhóm và chọn ít nhất một thành viên!', 'error');
      return;
    }

    if (!token) {
      showSnackbar('Vui lòng đăng nhập để tạo nhóm!', 'error');
      return;
    }

    const userId = localStorage.getItem('userId') || '680e6d95a73e35151128bf65';
    const finalMemberIds = [...new Set([...selectedMemberIds, userId])];

    setIsLoading(true);
    try {
      console.log('Creating group with:', { groupName, memberIds: finalMemberIds, token });
      const result = await createGroup(groupName, finalMemberIds, token);
      if (result) {
        showSnackbar('Tạo nhóm thành công!', 'success');
        setGroupName('');
        setSelectedMemberIds([]);
        onSuccess();
        onClose();
      } else {
        showSnackbar('Tạo nhóm thất bại!', 'error');
      }
    } catch (error) {
      showSnackbar('Lỗi tạo nhóm: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedMemberIds([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Tạo nhóm mới</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Tên nhóm"
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          Chọn thành viên
        </Typography>
        <List>
          {contacts
            .filter(contact => !contact.isGroup)
            .map(contact => (
              <ListItem key={contact.id}>
                <Checkbox
                  checked={selectedMemberIds.includes(contact.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMemberIds(prev => [...prev, contact.id]);
                    } else {
                      setSelectedMemberIds(prev => prev.filter(id => id !== contact.id));
                    }
                  }}
                />
                <ListItemText primary={contact.name} />
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button onClick={handleCreateGroup} disabled={isLoading}>
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupModal;
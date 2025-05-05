import axios from 'axios';

// Sử dụng proxy của Vite
const API_BASE_URL = '/api/group';

// Tạo nhóm
export const createGroup = async (name, memberIds, token) => {
  if (!token) {
    throw new Error('Token is missing');
  }
  const userId = localStorage.getItem('userId') || '680e6d95a73e35151128bf65';
  // Đảm bảo memberIds bao gồm userId (createId)
  const finalMemberIds = [...new Set([...memberIds, userId])];
  try {
    const response = await axios.post(
      API_BASE_URL,
      {
        name,
        createId: userId,
        memberIds: finalMemberIds
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Create group response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Lấy danh sách nhóm của người dùng
export const fetchUserGroups = async (userId, token) => {
  if (!token) {
    throw new Error('Token is missing');
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Fetch groups response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Lấy danh sách thành viên nhóm
export const fetchGroupMembers = async (groupId, token) => {
  if (!token) {
    throw new Error('Token is missing');
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/${groupId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Fetch group members response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching group members:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};
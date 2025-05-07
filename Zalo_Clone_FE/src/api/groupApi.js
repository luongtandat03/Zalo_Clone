import axios from 'axios';

const API_BASE_URL = '/api/group';

export const createGroup = async (name, memberIds, token) => {
  if (!token) {
    throw new Error('Token is missing');
  }
  const userId = localStorage.getItem('userId') || '680e6d95a73e35151128bf65';
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

export const addGroupMembers = async (groupId, userIds, token) => {
  if (!token) {
    throw new Error('Token is missing');
  }
  try {
    const response = await axios.post(`${API_BASE_URL}/${groupId}/members`, userIds, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    console.log('Add group members response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding group members:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const removeGroupMember = async (groupId, userId, token) => {
  if (!token) {
    throw new Error('Token is missing');
  }
  try {
    const response = await axios.delete(`${API_BASE_URL}/${groupId}/members/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Remove group member response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error removing group member:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const dissolveGroup = async (groupId, token) => {
  if (!token) {
    throw new Error('Token is missing');
  }
  try {
    const response = await axios.delete(`${API_BASE_URL}/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Dissolve group response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error dissolving group:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const assignGroupRole = async (groupId, userId, role, token) => {
  if (!token) {
    throw new Error('Token is missing');
  }
  try {
    const response = await axios.put(
      `${API_BASE_URL}/${groupId}/roles/${userId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { role }
      }
    );
    console.log('Assign group role response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error assigning group role:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};
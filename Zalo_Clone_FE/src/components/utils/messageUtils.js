/**
 * Utility functions for handling messages in the Zalo clone application
 */

/**
 * Process a received message to ensure it has the correct format
 * @param {Object} message - The message to process
 * @returns {Object} The processed message with correct format
 */
export const processMessage = (message) => {
  let createAt = message.createdAt || message.createAt;
  let parsedDate = new Date(createAt);
  
  // Handle invalid dates
  if (isNaN(parsedDate.getTime())) {
    console.warn('Invalid createAt value:', createAt, 'Using current time as fallback');
    parsedDate = new Date();
  } 
  // Fix timezone issues in date strings
  else if (typeof createAt === 'string' && !createAt.endsWith('Z') && !createAt.includes('+')) {
    createAt = `${createAt}Z`;
    parsedDate = new Date(createAt);
  }

  return {
    ...message,
    createAt: parsedDate.toISOString(),
    recalled: message.recalled || false,
    deletedByUsers: message.deletedByUsers || [],
    isRead: message.isRead || false,
    isPinned: message.isPinned || false,
  };
};

/**
 * Add a new message to the messages array, avoiding duplicates
 * @param {Array} prevMessages - Previous messages array
 * @param {Object} newMessage - The new message to add
 * @returns {Array} Updated messages array
 */
export const addMessageToArray = (prevMessages, newMessage) => {
  // Check if message already exists by ID
  const messageExistsById = prevMessages.some(msg => msg.id === newMessage.id);
  if (messageExistsById) {
    return prevMessages;
  }

  // Check if this is a server response to a temporary message we sent
  const messageExistsByContent = prevMessages.find(msg =>
    msg.tempKey &&
    msg.content === newMessage.content &&
    msg.senderId === newMessage.senderId &&
    (msg.receiverId === newMessage.receiverId || msg.groupId === newMessage.groupId)
  );

  if (messageExistsByContent) {
    // Replace temp message with confirmed message from server
    return prevMessages.map((msg) =>
      msg.tempKey === messageExistsByContent.tempKey
        ? { ...newMessage, tempKey: undefined }
        : msg
    );
  }

  // Check if message was deleted
  const deletedMessageIds = JSON.parse(localStorage.getItem('deletedMessageIds') || '[]');
  if (deletedMessageIds.includes(newMessage.id)) {
    return prevMessages;
  }

  // Add the new message
  return [...prevMessages, processMessage(newMessage)];
};

/**
 * Process message history returned from API
 * @param {Array} chatHistory - Chat history from API
 * @returns {Array} Processed chat history
 */
export const processChatHistory = (chatHistory) => {
  return chatHistory.reduce((acc, msg) => {
    // Filter out duplicates
    if (!acc.some(item => item.id === msg.id)) {
      acc.push(processMessage(msg));
    }
    return acc;
  }, []);
};
/*
 * @ (#) WebSocketService.java       1.0     4/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service;
/*
 * @author: Luong Tan Dat
 * @date: 4/20/2025
 */

import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;

public interface WebSocketService {
    void sendMessage(MessageRequest request);

    void sendGroupMessage(MessageRequest request);

    void notifyFriendRequest(String receiverId, String senderUsername);

    void notifyFriendRequestAccepted(String sender, String receiverUsername);

    void notifyRecall(String messageId, String userId);

    void notifyGroupRecall(String messageId, String userId,String groupId);

    void notifyDelete(String messageId, String userId);

    void notifyGroupDelete(String messageId, String userId,String groupId);

    void notifyRead(String messageId, String userId);

    void notifyPin(String messageId, String userId);

    void notifyUnpin(String messageId, String userId);


}

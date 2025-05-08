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

import vn.edu.iuh.fit.zalo_app_be.common.CallType;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
import vn.edu.iuh.fit.zalo_app_be.model.Group;

import java.util.List;

public interface WebSocketService {
    void sendMessage(MessageRequest request);

    void sendGroupMessage(MessageRequest request);

    void notifyFriendRequest(String receiverId, String senderId);

    void notifyFriendRequestAccepted(String sender, String receiverUsername);

    void notifyFriendRequestRejected(String userId, String receiverId);

    void notifyFriendDeleted(String userId, String friendId);

    void notifyUserBlocked(String userId, String blockedUserId);

    void notifyUserUnblocked(String userId, String unblockedUserId);

    void notifyRecall(String messageId, String userId);

    void notifyGroupRecall(String messageId, String userId, String groupId);

    void notifyDelete(String messageId, String userId);

    void notifyGroupDelete(String messageId, String userId, String groupId);

    void notifyRead(String messageId, String userId);

    void notifyEdit(String messageId, String userId, String content);

    void notifyGroupEdit(String messageId, String userId, String groupId);

    void notifyPin(String messageId, String userId);

    void notifyUnpin(String messageId, String userId);

    void notifyGroupCreate(Group group);

    void notifyGroupUpdate(Group group, String actorId, List<String> affectedMemberIds, String action);

    void notifyGroupDelete(Group group);

    void notifyCallInitiated(String callId, CallType callType, String callerId, String receiverId, Object spdOffer);

    void notifyGroupInitiated(String callId, CallType callType, String callerId, Group group, Object spdOffer);

    void notifyCallAnswer(String callId, String callerId, Object spdAnswer);

    void notifyGroupCallAnswer(String callId, String receiverId, Group group, Object spdAnswer);

    void notifyCallEnd(String callId, String receiverId);

    void notifyGroupCallEnd(String callId, String userId, Group group);

    void notifyIceCandidate(String callId, String receiverId, Object candidate);

    void notifyGroupIceCandidate(String callId, String userId, Group group, Object candidate);
}

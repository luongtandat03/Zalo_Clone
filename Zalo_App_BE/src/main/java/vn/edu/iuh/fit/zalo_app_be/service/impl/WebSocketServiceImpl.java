/*
 * @ (#) WebSocketServiceImpl.java       1.0     4/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service.impl;
/*
 * @author: Luong Tan Dat
 * @date: 4/20/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.zalo_app_be.common.FriendStatus;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;
import vn.edu.iuh.fit.zalo_app_be.exception.MessageSendException;
import vn.edu.iuh.fit.zalo_app_be.model.Group;
import vn.edu.iuh.fit.zalo_app_be.repository.GroupRepository;
import vn.edu.iuh.fit.zalo_app_be.repository.MessageRepository;
import vn.edu.iuh.fit.zalo_app_be.service.MessageService;
import vn.edu.iuh.fit.zalo_app_be.service.WebSocketService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "WEB-SOCKET-SERVICE")
public class WebSocketServiceImpl implements WebSocketService {
    private final SimpMessagingTemplate template;
    private final GroupRepository groupRepository;
    private final MessageService messageService;
    private final MessageRepository messageRepository;

    @Override
    public void sendMessage(MessageRequest request) {
        try {
            template.convertAndSendToUser(request.getSenderId(), "/queue/messages", request);
            template.convertAndSendToUser(request.getReceiverId(), "/queue/messages", request);

            log.info("Message sent from {} to {}: {}", request.getSenderId(), request.getReceiverId(), request.getContent());
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage());
            throw new MessageSendException("Error sending message");
        }
    }

    @Override
    public void sendGroupMessage(MessageRequest request) {
        try {
            Optional<Group> group = groupRepository.findById(request.getGroupId());
            if (group.isEmpty()) {
                log.error("Group not found: {}", request.getGroupId());
                throw new MessageSendException("Group not found");
            }
            template.convertAndSend("/topic/group/" + request.getGroupId(), request);
            log.info("Group message sent from {} to group {}: {}", request.getSenderId(), request.getGroupId(), request.getContent());
        } catch (Exception e) {
            log.error("Error sending group message: {}", e.getMessage());
            throw new MessageSendException("Error sending group message");
        }
    }

    @Override
    public void notifyFriendRequest(String receiverId, String senderUsername) {
        template.convertAndSendToUser(receiverId, "/queue/notifications", Map.of("type", FriendStatus.PENDING, "sender", senderUsername));
        log.info("Friend request notification sent to {} from {}", receiverId, senderUsername);
    }

    @Override
    public void notifyFriendRequestAccepted(String senderId, String receiverUsername) {
        template.convertAndSendToUser(senderId, "queue/notifications", Map.of("type", FriendStatus.ACCEPTED, "receiver", receiverUsername));
        log.info("Friend request accepted notification sent to {} from {}", senderId, receiverUsername);
    }

    @Override
    public void notifyRecall(String messageId, String userId) {
        MessageResponse messageResponse = messageService.convertToMessageResponse(messageRepository.findById(messageId).orElseThrow());
        template.convertAndSendToUser(userId, "/queue/recall", messageResponse);
        if (!userId.equals(messageResponse.getReceiverId())) {
            template.convertAndSendToUser(messageResponse.getReceiverId(), "/queue/recall", messageResponse);
        }
        log.info("Recall notification sent for message {} to user {}", messageId, userId);
    }

    @Override
    public void notifyGroupRecall(String messageId, String userId, String groupId) {
        MessageResponse response = messageService.convertToMessageResponse(
                messageRepository.findById(messageId).orElseThrow()
        );
        template.convertAndSend("/topic/group/" + groupId, response);
    }

    @Override
    public void notifyDelete(String messageId, String userId) {
        MessageResponse messageResponse = messageService.convertToMessageResponse(messageRepository.findById(messageId).orElseThrow());
        template.convertAndSendToUser(userId, "/queue/delete", messageResponse);
        log.info("Delete notification sent for message {} to user {}", messageId, userId);
    }

    @Override
    public void notifyGroupDelete(String messageId, String userId, String groupId) {
        MessageResponse response = messageService.convertToMessageResponse(
                messageRepository.findById(messageId).orElseThrow()
        );
        template.convertAndSend("/topic/group/" + groupId, response);
        log.info("Group delete notification sent for message {} to user {}", messageId, userId);
    }

    @Override
    public void notifyRead(String messageId, String userId) {
        MessageResponse response = messageService.convertToMessageResponse(messageRepository.findById(messageId).orElseThrow());
        template.convertAndSendToUser(userId, "/queue/read", response);
        log.info("Read notification sent for message {} to user {}", messageId, userId);
    }

    @Override
    public void notifyPin(String messageId, String userId) {
        MessageResponse response = messageService.convertToMessageResponse(messageRepository.findById(messageId).orElseThrow());
        template.convertAndSendToUser(userId, "/queue/pin", response);
        if (response.getGroupId() != null) {
            template.convertAndSend("/topic/group/" + response.getGroupId(), response);
        }
        log.info("Pin notification sent for message {} to user {}", messageId, userId);
    }

    @Override
    public void notifyUnpin(String messageId, String userId) {
        MessageResponse response = messageService.convertToMessageResponse(messageRepository.findById(messageId).orElseThrow());
        template.convertAndSendToUser(userId, "/queue/unpin", response);
        if (response.getGroupId() != null) {
            template.convertAndSend("/topic/group/" + response.getGroupId(), response);
        }
        log.info("Unpin notification sent for message {} to user {}", messageId, userId);
    }

    @Override
    public void notifyGroupCreate(Group group) {
        for (String memberId : group.getMemberIds()) {
            template.convertAndSendToUser(memberId, "/queue/group/create", group);
            log.info("Group creation notification sent to {}: {}", memberId, group.getName());
        }
    }

    @Override
    public void notifyGroupUpdate(Group group, String actorId, List<String> affectedMemberIds, String action) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("group", group);
        notification.put("actorId", actorId);
        notification.put("affectedMemberIds", affectedMemberIds);
        notification.put("action", action);

        for (String memberId : group.getMemberIds()) {
            template.convertAndSendToUser(
                    memberId,
                    "/queue/group/updated",
                    notification
            );
        }

        if (affectedMemberIds != null) {
            for (String memberId : affectedMemberIds) {
                if (!group.getMemberIds().contains(memberId)) {
                    template.convertAndSendToUser(
                            memberId,
                            "/queue/group/updated",
                            notification
                    );
                }
            }
        }
    }

    @Override
    public void notifyGroupDelete(Group group) {
        for (String memberId : group.getMemberIds()) {
            template.convertAndSendToUser(memberId, "/queue/group/delete", group);
            log.info("Group deletion notification sent to {}: {}", memberId, group.getName());
        }
    }

}

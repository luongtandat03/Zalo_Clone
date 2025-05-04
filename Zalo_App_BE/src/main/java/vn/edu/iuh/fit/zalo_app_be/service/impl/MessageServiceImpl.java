package vn.edu.iuh.fit.zalo_app_be.service.impl;

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

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "WEB-SOCKET-SERVICE")
class WebSocketServiceImpl implements WebSocketService {
    private final SimpMessagingTemplate template;
    private final GroupRepository groupRepository;
    private final MessageService messageService;
    private final MessageRepository messageRepository;

    @Override
    public void sendMessage(MessageRequest request) {
        try {
            // Gửi tới người nhận
            template.convertAndSendToUser(request.getReceiverId(), "/queue/messages", request);
            // Gửi tới người gửi
            template.convertAndSendToUser(request.getSenderId(), "/queue/messages", request);
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
            for (String memberId : group.get().getMemberIds()) {
                template.convertAndSendToUser(memberId, "/queue/messages", request);
                log.info("Group message sent from {} to {}: {}", request.getSenderId(), memberId, request.getContent());
            }
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
        template.convertAndSendToUser(senderId, "/queue/notifications", Map.of("type", FriendStatus.ACCEPTED, "receiver", receiverUsername));
        log.info("Friend request accepted notification sent to {} from {}", senderId, receiverUsername);
    }

    @Override
    public void notifyRecall(String messageId, String userId) {
        MessageResponse messageResponse = messageService.convertToMessageResponse(messageRepository.findById(messageId).orElseThrow());
        // Gửi tới người thực hiện hành động
        template.convertAndSendToUser(userId, "/queue/recall", messageResponse);
        // Gửi tới người nhận
        if (!userId.equals(messageResponse.getRecipientId())) {
            template.convertAndSendToUser(messageResponse.getRecipientId(), "/queue/recall", messageResponse);
        }
        log.info("Recall notification sent for message {} to user {}", messageId, userId);
    }

    @Override
    public void notifyDelete(String messageId, String userId) {
        MessageResponse messageResponse = messageService.convertToMessageResponse(messageRepository.findById(messageId).orElseThrow());
        // Gửi tới người thực hiện hành động
        template.convertAndSendToUser(userId, "/queue/delete", messageResponse);
        // Gửi tới người nhận
        if (!userId.equals(messageResponse.getRecipientId())) {
            template.convertAndSendToUser(messageResponse.getRecipientId(), "/queue/delete", messageResponse);
        }
        log.info("Delete notification sent for message {} to user {}", messageId, userId);
    }

    @Override
    public void notifyForward(String messageId, String userId, String receiverId) {
        MessageResponse messageResponse = messageService.convertToMessageResponse(messageRepository.findById(messageId).orElseThrow());
        template.convertAndSendToUser(receiverId, "/queue/forward", messageResponse);
    }
}
package vn.edu.iuh.fit.zalo_app_be.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;
import vn.edu.iuh.fit.zalo_app_be.service.MessageService;
import vn.edu.iuh.fit.zalo_app_be.service.WebSocketService;

@Controller
@RequiredArgsConstructor
@Slf4j(topic = "CHAT-CONTROLLER")
public class ChatController {
    private final WebSocketService webSocketService;
    private final MessageService messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request) {
        String senderId = request.getSenderId();
        String receiverId = request.getReceiverId();
        String content = request.getContent();
        String groupId = request.getGroupId();
        String tempId = request.getTempId();

        log.debug("Processing send message request: senderId={}, receiverId={}, groupId={}", senderId, receiverId, groupId);
        try {
            if (senderId == null || receiverId == null) {
                throw new RuntimeException("Invalid message request: missing senderId or receiverId");
            }

            MessageResponse messageResponse = messageService.saveMessage(request);
            MessageRequest responseRequest = new MessageRequest(senderId, receiverId, content, groupId, MessageType.TEXT);
            responseRequest.setId(messageResponse.getId());
            responseRequest.setTempId(tempId);
            responseRequest.setRecalled(messageResponse.isRecalled());
            responseRequest.setDeletedByUsers(messageResponse.getDeletedByUsers());

            if (groupId != null) {
                webSocketService.sendGroupMessage(responseRequest);
                log.info("Group message sent from {} to group {}: {}", senderId, groupId, content);
            } else {
                webSocketService.sendMessage(responseRequest);
                log.info("Message sent from {} to {}: {}", senderId, receiverId, content);
            }
        } catch (Exception e) {
            log.error("Error processing message: sender={}, receiver={}, error={}", senderId, receiverId, e.getMessage());
            throw e;
        }
    }

    @MessageMapping("/chat.recall")
    public void recallMessage(@Payload MessageRequest request) {
        String messageId = request.getId();
        String userId = request.getSenderId();
        String tempId = request.getTempId();

        log.debug("Processing recall message request: messageId={}, userId={}", messageId, userId);
        try {
            if (messageId == null && tempId == null) {
                throw new RuntimeException("Invalid recall message request: missing messageId or tempId");
            }

            String resolvedMessageId = messageId;
            if (messageId == null) {
                resolvedMessageId = messageService.findMessageIdByTempId(tempId);
            }

            messageService.recallMessage(resolvedMessageId, userId);
            webSocketService.notifyRecall(resolvedMessageId, userId);
            log.info("Message recalled: messageId={}, userId={}", resolvedMessageId, userId);
        } catch (Exception e) {
            log.error("Error processing recall message: messageId={}, userId={}, error={}", messageId, userId, e.getMessage());
            throw e;
        }
    }

    @MessageMapping("/chat.delete")
    public void deleteMessage(@Payload MessageRequest request) {
        String messageId = request.getId();
        String userId = request.getSenderId();
        String tempId = request.getTempId();

        log.debug("Processing delete message request: messageId={}, userId={}", messageId, userId);
        try {
            if (messageId == null && tempId == null) {
                throw new RuntimeException("Invalid delete message request: missing messageId or tempId");
            }

            String resolvedMessageId = messageId;
            if (messageId == null) {
                resolvedMessageId = messageService.findMessageIdByTempId(tempId);
            }

            messageService.deleteMessage(resolvedMessageId, userId);
            webSocketService.notifyDelete(resolvedMessageId, userId);
            log.info("Message deleted: messageId={}, userId={}", resolvedMessageId, userId);
        } catch (Exception e) {
            log.error("Error processing delete message: messageId={}, userId={}, error={}", messageId, userId, e.getMessage());
            throw e;
        }
    }

    @MessageMapping("/chat.forward")
    public void forwardMessage(@Payload MessageRequest request) {
        String messageId = request.getId();
        String userId = request.getSenderId();
        String receiverId = request.getReceiverId();
        String groupId = request.getGroupId();
        String tempId = request.getTempId();

        log.debug("Processing forward message request: messageId={}, userId={}, receiverId={}", messageId, userId, receiverId);
        try {
            if (messageId == null && tempId == null) {
                throw new RuntimeException("Invalid forward message request: missing messageId or tempId");
            }
            if (userId == null || receiverId == null) {
                throw new RuntimeException("Invalid forward message request: missing userId or receiverId");
            }

            String resolvedMessageId = messageId;
            if (messageId == null) {
                resolvedMessageId = messageService.findMessageIdByTempId(tempId);
            }

            messageService.forwardMessage(resolvedMessageId, userId, receiverId);
            webSocketService.sendMessage(new MessageRequest(userId, receiverId, request.getContent(), groupId, MessageType.FORWARD));
            log.info("Message forwarded: messageId={}, userId={}, receiverId={}, groupId={}", resolvedMessageId, userId, receiverId, groupId);
        } catch (Exception e) {
            log.error("Error processing forward message: messageId={}, userId={}, receiverId={}, error={}", messageId, userId, receiverId, e.getMessage());
            throw e;
        }
    }
}
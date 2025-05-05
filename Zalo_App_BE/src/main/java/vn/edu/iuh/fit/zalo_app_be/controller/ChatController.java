/*
 * @ (#) ChatController.java       1.0     4/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller;
/*
 * @author: Luong Tan Dat
 * @date: 4/20/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;
import vn.edu.iuh.fit.zalo_app_be.service.MessageService;
import vn.edu.iuh.fit.zalo_app_be.service.WebSocketService;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j(topic = "CHAT-CONTROLLER")
public class ChatController {
    private final WebSocketService webSocketService;
    private final MessageService messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request) {
        log.debug("Processing chat request: sender={}, receiver={}",
                request.getSenderId(), request.getReceiverId());
        try {
            if (request.getSenderId() == null || request.getReceiverId() == null) {
                throw new RuntimeException("Invalid message request: missing senderId or receiverId");
            }

            MessageResponse response = messageService.saveMessage(request);

            request.setId(response.getId());
            request.setRecalled(response.isRecalled());
            request.setDeletedByUsers(response.getDeletedByUsers());
            request.setSenderId(request.getSenderId());
            request.setReceiverId(request.getReceiverId());
            request.setGroupId(request.getGroupId());
            request.setContent(request.getContent());
            request.setType(request.getType() != null ? request.getType() : MessageType.TEXT);

            if (request.getGroupId() != null) {
                webSocketService.sendGroupMessage(request);
                log.info("Group message sent from {} to group {}: {}",
                        request.getSenderId(), request.getGroupId(), request.getContent());
            } else {
                webSocketService.sendMessage(request);
                log.info("Message sent from {} to {}: {}",
                        request.getSenderId(), request.getReceiverId(), request.getContent());
            }

        } catch (Exception e) {
            log.error("Error processing message: sender={}, receiver={}, error={}",
                    request.getSenderId(), request.getReceiverId(), e.getMessage());
            throw e;
        }

    }

    @MessageMapping("/chat.recall")
    public void recallMessage(@Payload MessageRequest request) {
        String messageId = request.getId();
        String userId = request.getSenderId();

        log.debug("Processing recall message request: messageId={}, userId={}",
                messageId, userId);
        try {
            if (messageId == null || userId == null) {
                throw new RuntimeException("Invalid recall message request: missing messageId or userId");
            }

            messageService.recallMessage(messageId, userId);
            webSocketService.notifyRecall(messageId, userId);
            log.info("Message recalled: messageId={}, userId={}",
                    messageId, userId);
        } catch (Exception e) {
            log.error("Error processing recall message: messageId={}, userId={}, error={}",
                    messageId, userId, e.getMessage());
            throw e;
        }
    }

    @MessageMapping("/chat.delete")
    public void deleteMessage(@Payload MessageRequest request) {
        String messageId = request.getId();
        String userId = request.getSenderId();

        log.debug("Processing delete message request: messageId={}, userId={}",
                messageId, userId);
        try {
            if (messageId == null || userId == null) {
                throw new RuntimeException("Invalid delete message request: missing messageId or userId");
            }

            messageService.deleteMessage(messageId, userId);
            webSocketService.notifyDelete(messageId, userId);
            log.info("Message deleted: messageId={}, userId={}",
                    messageId, userId);
        } catch (Exception e) {
            log.error("Error processing delete message: messageId={}, userId={}, error={}",
                    messageId, userId, e.getMessage());
            throw e;
        }
    }

    @MessageMapping("/chat.forward")
    public void forwardMessage(@Payload MessageRequest request) {
        String messageId = request.getId();
        String userId = request.getSenderId();
        String receiverId = request.getReceiverId();
        String groupId = request.getGroupId();

        log.debug("Processing forward message request: messageId={}, userId={}, receiverId={}",
                messageId, userId, receiverId);
        try {
            if (messageId == null || userId == null || receiverId == null) {
                throw new RuntimeException("Invalid forward message request: missing messageId, userId or receiverId");
            }

            messageService.forwardMessage(messageId, userId, receiverId);
            webSocketService.sendMessage(new MessageRequest(userId, receiverId, request.getContent(), groupId, MessageType.FORWARD));
            log.info("Message forwarded: messageId={}, userId={}, receiverId={}, groupId={}",
                    messageId, userId, receiverId, groupId);
        } catch (Exception e) {
            log.error("Error processing forward message: messageId={}, userId={}, receiverId={}, error={}",
                    messageId, userId, receiverId, e.getMessage());
            throw e;
        }
    }

    @MessageMapping("/chat.read")
    public void readMessage(@Payload MessageRequest request) {
        String messageId = request.getId();
        String senderId = request.getSenderId();
        String receiverId = request.getReceiverId();


        log.debug("Processing read message request: messageId={}, userId={}",
                messageId, receiverId);
        try {
            if (messageId == null || receiverId == null) {
                throw new RuntimeException("Invalid read message request: missing messageId or userId");
            }

            messageService.readMessage(messageId, receiverId);
            webSocketService.notifyRead(messageId, senderId);
            log.info("Message read: messageId={}, userId={}",
                    messageId, receiverId);
        } catch (Exception e) {
            log.error("Error processing read message: messageId={}, userId={}, error={}",
                    messageId, receiverId, e.getMessage());
            throw e;
        }
    }
}

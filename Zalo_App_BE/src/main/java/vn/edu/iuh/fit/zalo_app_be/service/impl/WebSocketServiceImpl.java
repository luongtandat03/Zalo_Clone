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
import vn.edu.iuh.fit.zalo_app_be.service.WebSocketService;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "WEB-SOCKET-SERVICE")
public class WebSocketServiceImpl implements WebSocketService {
    private final SimpMessagingTemplate template;

    @Override
    public void sendMessage(MessageRequest request) {
        template.convertAndSendToUser(request.getReceiverId(), "/queue/messages", request);
        log.info("Message sent from {} to {}: {}", request.getSenderId(), request.getReceiverId(), request.getContent());
        template.convertAndSendToUser(request.getSenderId(), "/queue/messages", request);
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
}

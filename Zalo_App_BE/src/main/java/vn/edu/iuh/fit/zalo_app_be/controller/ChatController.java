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
import org.springframework.stereotype.Controller;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
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
        log.debug("Processing chat request: sender={}, receiver={}",
                request.getSenderId(), request.getReceiverId());
        try {
            if (request.getSenderId() == null || request.getReceiverId() == null) {
                throw new RuntimeException("Invalid message request: missing senderId or receiverId");
            }

            messageService.saveMessage(request);
            webSocketService.sendMessage(request);
            log.info("Message sent from {} to {}: {}",
                    request.getSenderId(), request.getReceiverId(), request.getContent());
        } catch (Exception e) {
            log.error("Error processing message: sender={}, receiver={}, error={}",
                    request.getSenderId(), request.getReceiverId(), e.getMessage());
            throw e;
        }
    }
}

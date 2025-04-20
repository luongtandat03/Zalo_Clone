/*
 * @ (#) MessageController.java       1.0     4/17/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller;
/*
 * @author: Luong Tan Dat
 * @date: 4/17/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;
import vn.edu.iuh.fit.zalo_app_be.model.Message;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;
import vn.edu.iuh.fit.zalo_app_be.service.MessageService;
import vn.edu.iuh.fit.zalo_app_be.service.UserService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-CONTROLLER")
@RequestMapping("/message")
public class MessageController {
    private final MessageService messageService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserRepository userRepository;

    @GetMapping("/chat-history")
    public ResponseEntity<List<MessageResponse>> getChatHistory(@PathVariable String userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = userRepository.findByUsername(authentication.getName()).getId();

        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(messageService.getChatHistory(userId, currentUser));
    }

    @PostMapping("/upload-file")
    public ResponseEntity<Map<Object, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("receiverId") String receiverId
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String senderId = userRepository.findByUsername(authentication.getName()).getId();

        if (senderId == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            MessageRequest request = new MessageRequest(
                    senderId,
                    receiverId,
                    LocalDateTime.now(),
                    LocalDateTime.now()
            );


            String url = messageService.uploadFile(file, request);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", Objects.requireNonNull(e.getReason())));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload file"));
        }
    }
}

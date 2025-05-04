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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-CONTROLLER")
@RequestMapping("/message")
public class MessageController {
    private final MessageService messageService;
    private final UserRepository userRepository;

    @GetMapping("/chat-history/{userId}")
    public ResponseEntity<List<MessageResponse>> getChatHistory(@PathVariable String userId) {
        return ResponseEntity.ok(messageService.getChatHistory(userId));
    }

    @GetMapping("/chat-history/group/{groupId}")
    public ResponseEntity<List<MessageResponse>> getGroupChatHistory(@PathVariable String groupId) {
        return ResponseEntity.ok(messageService.getGroupChatHistory(groupId));
    }

    @PostMapping("/upload-file")
    public ResponseEntity<List<Map<String, String>>> uploadFile(
            @RequestParam("file") List<MultipartFile> files,
            @RequestParam(value = "receiverId", required = false) String receiverId,
            @RequestParam(value = "groupId", required = false) String groupId,
            @RequestParam(value = "replyToMessageId", required = false) String replyToMessageId
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String senderId = userRepository.findByUsername(authentication.getName()).getId();

        if (senderId == null) {
            return ResponseEntity.status(401).build();
        }

        log.debug("Uploading files: senderId={}, groupId={}, receiverId={}", senderId, groupId, receiverId);

        List<Map<String, String>> fileResults = new ArrayList<>();
        for (MultipartFile file : files) {
            MessageRequest request = new MessageRequest();
            request.setSenderId(senderId);
            request.setReceiverId(receiverId);
            request.setGroupId(groupId);
            request.setReplyToMessageId(replyToMessageId);
            fileResults.add(messageService.uploadFile(file, request));
        }
        log.info("Uploaded files: {}", fileResults);
        return new ResponseEntity<>(fileResults, HttpStatus.OK);
    }

}

/*
 * @ (#) MessageServiceImpl.java       1.0     4/17/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service.impl;
/*
 * @author: Luong Tan Dat
 * @date: 4/17/2025
 */

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;
import vn.edu.iuh.fit.zalo_app_be.exception.ResourceNotFoundException;
import vn.edu.iuh.fit.zalo_app_be.model.Message;
import vn.edu.iuh.fit.zalo_app_be.model.User;
import vn.edu.iuh.fit.zalo_app_be.repository.MessageRepository;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;
import vn.edu.iuh.fit.zalo_app_be.service.MessageService;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSASGE-SERVICE")
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;

    @Override
    public void sendMessage(MessageRequest request) {
        validateUser(request.getSenderId(), request.getReceiverId());
        Message message = new Message(
                request.getSenderId(),
                request.getReceiverId(),
                request.getContent(),
                request.getType(),
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        messageRepository.save(message);
        log.info("Message sent from {} to {}: {}", request.getSenderId(), request.getReceiverId(), request.getContent());
    }

    @Override
    public String uploadFile(MultipartFile file, MessageRequest request) {
        validateUser(request.getSenderId(), request.getReceiverId());
        if (file == null || file.isEmpty()) {
            throw new ResourceNotFoundException("File not found");
        }

        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new ResourceNotFoundException("File size exceeds limit");
        }

        try {
            String contentType = file.getContentType();
            MessageType type;
            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    type = MessageType.IMAGE;
                } else if (contentType.startsWith("video/")) {
                    type = MessageType.VIDEO;
                } else
                    type = MessageType.FILE;
            } else
                type = MessageType.FILE;
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto", "folder", "chat_files"));
            String url = (String) uploadResult.get("secure_url");

            Message message = new Message(request.getSenderId(), request.getReceiverId(), url, type, LocalDateTime.now(), LocalDateTime.now());
            messageRepository.save(message);
            log.info("File uploaded successfully: {} for sender: {} ", url, request.getSenderId());
            return url;

        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new ResourceNotFoundException("File upload failed");
        }
    }

    @Override
    public List<MessageResponse> getChatHistory(String userId, String userOtherId) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(userId, userOtherId, userId, userOtherId)
                .stream()
                .map(message -> new MessageResponse(
                                message.getSenderId(),
                                message.getReceiverId(),
                                message.getContent(),
                                message.getType(),
                                message.getCreatedAt(),
                                message.getUpdatedAt()
                        )
                ).sorted(Comparator.comparing(MessageResponse::getCreateAt))
                .collect(Collectors.toList());
    }

    private void validateUser(String senderId, String receiverId) {
        Optional<User> userSender = userRepository.findById(senderId);
        if (userSender.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }
        Optional<User> userReceiver = userRepository.findById(receiverId);
        if (userReceiver.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }
    }
}


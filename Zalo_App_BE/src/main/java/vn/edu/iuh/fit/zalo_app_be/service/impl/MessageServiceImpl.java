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
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.iuh.fit.zalo_app_be.common.MessageStatus;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;
import vn.edu.iuh.fit.zalo_app_be.exception.ResourceNotFoundException;
import vn.edu.iuh.fit.zalo_app_be.model.Message;
import vn.edu.iuh.fit.zalo_app_be.model.MessageReference;
import vn.edu.iuh.fit.zalo_app_be.model.User;
import vn.edu.iuh.fit.zalo_app_be.repository.MessageRepository;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;
import vn.edu.iuh.fit.zalo_app_be.service.MessageService;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSASGE-SERVICE")
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;

    @Override
    public void saveMessage(MessageRequest request) {
        validateUser(request.getSenderId(), request.getReceiverId());
        log.info("Sending message from {} to {}: {}", request.getSenderId(), request.getReceiverId(), request.getContent());
        try {

            Message message = new Message();
            message.setSenderId(request.getSenderId());
            message.setReceiverId(request.getReceiverId());
            message.setContent(request.getContent());
            message.setType(request.getType() != null ? request.getType() : MessageType.TEXT);
            message.setImageUrls(request.getImageUrls());
            message.setVideoInfos(request.getVideoInfos());
            message.setReplyToMessageId(request.getReplyToMessageId());
            message.setForwardedFrom(request.getForwardedFrom() != null ? new MessageReference(
                    request.getForwardedFrom().getMessageId(), request.getForwardedFrom().getOriginalSenderId()) : null);
            message.setStatus(MessageStatus.SENT);
            message.setCreatedAt(LocalDateTime.now());
            message.setUpdatedAt(LocalDateTime.now());
            message.setRead(false);

            messageRepository.save(message);
            log.info("Message sent from {} to {}: {}", request.getSenderId(), request.getReceiverId(), request.getContent());
        } catch (Exception e) {
            throw new RuntimeException("Error saving message: " + e.getMessage());
        }
    }

    @Override
    public String uploadFile(MultipartFile file, MessageRequest request) {
        validateUser(request.getSenderId(), request.getReceiverId());
        if (file == null || file.isEmpty()) {
            throw new ResourceNotFoundException("File not found");
        }

        if (file.getSize() > 10 * 1024 * 1024) // 10MB
        {
            throw new ResourceNotFoundException("File size exceeds limit");
        }

        try {
            String contentType = file.getContentType();
            MessageType type;
            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    type = MessageType.IMAGE;
                }
                if (contentType.startsWith("video/")) {
                    type = MessageType.VIDEO;
                } else {
                    type = MessageType.FILE;
                }
            } else {
                type = MessageType.FILE;
            }
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto", "folder", "chat_files"));
            String url = (String) uploadResult.get("secure_url");
            String thumbnail = type == MessageType.VIDEO ? (String) uploadResult.get("thumbnail") : null;

            Message message = new Message();
            message.setSenderId(request.getSenderId());
            message.setReceiverId(request.getReceiverId());
            message.setType(type);
            if (type == MessageType.IMAGE) {
                message.setImageUrls(Collections.singletonList(url));
            } else if (type == MessageType.VIDEO) {
                message.setVideoInfos(Collections.singletonList(Map.of("url", url, "thumbnail", thumbnail != null ? thumbnail : url)));
            } else {
                message.setContent(url);
            }
            message.setReplyToMessageId(request.getReplyToMessageId());
            message.setStatus(MessageStatus.SENT);
            message.setCreatedAt(LocalDateTime.now());
            message.setUpdatedAt(LocalDateTime.now());
            message.setRead(false);

            messageRepository.save(message);
            log.info("File uploaded: {} for sender: {}", url, request.getSenderId());

            return url;
        } catch (Exception e) {
            log.info("Error uploading file: {}", e.getMessage());
            throw new RuntimeException("Error uploading file: " + e.getMessage());
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
                                message.getImageUrls(),
                                message.getVideoInfos(),
                                message.getReplyToMessageId(),
                                message.isRecalled(),
                                message.getDeleteBy() != null ? new ArrayList<>(message.getDeleteBy().keySet()) : null,
                                message.getStatus(),
                                message.getForwardedFrom() != null ? new MessageReference(
                                        message.getForwardedFrom().getMessageId(), message.getForwardedFrom().getOriginalSenderId()) : null,
                                message.isRead(),
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


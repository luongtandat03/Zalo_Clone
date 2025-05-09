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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.iuh.fit.zalo_app_be.common.MessageStatus;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;
import vn.edu.iuh.fit.zalo_app_be.exception.ResourceNotFoundException;
import vn.edu.iuh.fit.zalo_app_be.model.Group;
import vn.edu.iuh.fit.zalo_app_be.model.Message;
import vn.edu.iuh.fit.zalo_app_be.model.MessageReference;
import vn.edu.iuh.fit.zalo_app_be.model.User;
import vn.edu.iuh.fit.zalo_app_be.repository.GroupRepository;
import vn.edu.iuh.fit.zalo_app_be.repository.MessageRepository;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;
import vn.edu.iuh.fit.zalo_app_be.service.MessageService;

import java.net.URL;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSASGE-SERVICE")
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final Cloudinary cloudinary;

    @Override
    public MessageResponse saveMessage(MessageRequest request) {
        if (request.getGroupId() == null) {
            validateUser(request.getSenderId(), request.getReceiverId());
        } else {
            validateGroup(request.getGroupId(), request.getSenderId());
        }
        log.info("Sending message from {} to {}: {}", request.getSenderId(), request.getReceiverId(), request.getContent());
        try {
            Message message = new Message();
            message.setSenderId(request.getSenderId());
            message.setReceiverId(request.getReceiverId());
            message.setGroupId(request.getGroupId());
            message.setContent(request.getContent());
            MessageType type = request.getType() != null ? request.getType() : MessageType.TEXT;
            if (type == MessageType.GIF || type == MessageType.STICKER) {
                if (!isValidUrl(request.getContent())) {
                    throw new ResourceNotFoundException("URL is not valid");
                }
            }

            message.setType(type);
            message.setImageUrls(request.getImageUrls());
            message.setVideoInfos(request.getVideoInfos());
            message.setReplyToMessageId(request.getReplyToMessageId());
            message.setForwardedFrom(request.getForwardedFrom() != null ? new MessageReference(
                    request.getForwardedFrom().getMessageId(), request.getForwardedFrom().getOriginalSenderId(), message.getForwardedFrom().getForwardedAt()) : null);
            message.setThumbnail(request.getThumbnail());
            message.setStatus(MessageStatus.SENT);
            message.setCreatedAt(LocalDateTime.now());
            message.setUpdatedAt(LocalDateTime.now());
            message.setRead(false);
            message.setPinned(request.isPinned());
            message.setPinnedAt(request.getPinnedAt() != null ? request.getPinnedAt() : LocalDateTime.now());

            Message newMessage = messageRepository.save(message);
            log.info("Message sent from {} to {}: {}", request.getSenderId(), request.getReceiverId(), request.getContent());

            return convertToMessageResponse(newMessage);
        } catch (Exception e) {
            throw new RuntimeException("Error saving message: " + e.getMessage());
        }
    }

    @Override
    public Map<String, String> uploadFile(MultipartFile file, MessageRequest request) {
        if (request.getGroupId() == null) {
            validateUser(request.getSenderId(), request.getReceiverId());
        } else {
            validateGroup(request.getGroupId(), request.getSenderId());
        }
        if (file == null || file.isEmpty()) {
            throw new ResourceNotFoundException("File not found");
        }

        if (file.getSize() > 50 * 1024 * 1024) // 50MB
        {
            throw new ResourceNotFoundException("File size exceeds limit");
        }

        try {
            String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file";
            String contentType = file.getContentType();
            String resourceType;
            MessageType type;

            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    resourceType = "image";
                    type = MessageType.IMAGE;
                } else if (contentType.startsWith("video/")) {
                    resourceType = "video";
                    type = MessageType.VIDEO;
                } else if (contentType.startsWith("audio/")) {
                    resourceType = "audio";
                    type = MessageType.AUDIO;
                } else {
                    resourceType = "raw";
                    type = MessageType.FILE;
                }
            } else {
                log.info("Content type is null : {} , defaulting to raw", originalFileName);
                resourceType = "raw";
                type = MessageType.FILE;
            }

            String fileExtension = originalFileName.contains(".") ? originalFileName.substring(originalFileName.lastIndexOf(".")) : "";
            String sanitizedFileName = originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");

            String publicId = sanitizedFileName + fileExtension;

            log.info("Uploading file to Cloudinary: {} with public ID: {}", originalFileName, publicId);

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", resourceType, "folder", "chat_files", "public_id", publicId));
            String url = (String) uploadResult.get("secure_url");
            String cloudinaryPublicId = (String) uploadResult.get("public_id");
            String thumbnail = (type == MessageType.VIDEO || type == MessageType.AUDIO) ? (String) uploadResult.get("thumbnail") : null;

            String version = extractVersionFromUrl(url);
            if (version == null) {
                log.warn("Could not extract version from Secure URL: {}", url);
            }

            Map resourceInfo = cloudinary.api().resource(cloudinaryPublicId, ObjectUtils.asMap("resource_type", resourceType));
            if (resourceInfo == null || !url.equals(resourceInfo.get("secure_url"))) {
                throw new ResourceNotFoundException("Upload file not found on Cloudinary");
            }

            Map<String, String> signatureParams = new HashMap<>();
            signatureParams.put("public_id", cloudinaryPublicId);
            signatureParams.put("resource_type", resourceType);
            String signedUrl = cloudinary.url()
                    .secure(true)
                    .resourceType(resourceType)
                    .generate(cloudinaryPublicId);

            Message message = new Message();
            message.setSenderId(request.getSenderId());
            message.setReceiverId(request.getReceiverId());
            message.setGroupId(request.getGroupId());
            message.setType(type);
            message.setContent(signedUrl);
            message.setThumbnail(thumbnail);
            message.setPublicId(cloudinaryPublicId);
            message.setFileName(originalFileName);
            message.setReplyToMessageId(request.getReplyToMessageId());
            message.setStatus(MessageStatus.SENT);
            message.setCreatedAt(LocalDateTime.now());
            message.setUpdatedAt(LocalDateTime.now());
            message.setRead(false);


            messageRepository.save(message);
            log.info("File uploaded: {} with origin name: {} for sender: {}", originalFileName, originalFileName, request.getSenderId());

            return Map.of(
                    "url", signedUrl,
                    "type", type.toString(),
                    "thumbnail", thumbnail != null ? thumbnail : "",
                    "fileName", originalFileName,
                    "publicId", cloudinaryPublicId != null ? cloudinaryPublicId : "",
                    "version", version != null ? version : ""
            );

        } catch (Exception e) {
            log.info("Error uploading file: {}", e.getMessage());
            throw new RuntimeException("Error uploading file: " + e.getMessage());
        }
    }


    @Override
    public List<MessageResponse> getChatHistory(String userOtherId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = userRepository.findByUsername(authentication.getName()).getId();

        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(currentUser, userOtherId, currentUser, userOtherId)
                .stream()
                .map(this::convertToMessageResponse)
                .sorted(Comparator.comparing(MessageResponse::getCreateAt))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageResponse> getGroupChatHistory(String groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = userRepository.findByUsername(authentication.getName()).getId();

        validateGroup(groupId, currentUser);

        return messageRepository.findByGroupId(groupId)
                .stream()
                .map(this::convertToMessageResponse)
                .sorted(Comparator.comparing(MessageResponse::getCreateAt))
                .collect(Collectors.toList());
    }

    @Override
    public void recallMessage(String messageId, String userId) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isPresent()) {
            Message message = messageOptional.get();
            if (!message.getSenderId().equals(userId)) {
                throw new ResourceNotFoundException("User not found");
            }
            message.setRecalled(true);
            message.setContentAfterRecallOrDeleteOrEdit(messageOptional.get().getContent());
            message.setContent("Tin nhắn đã được thu hồi");
            messageRepository.save(message);
            log.info("Message recalled: {} for sender: {}", messageId, message.getSenderId());
        } else {
            throw new ResourceNotFoundException("Message not found");
        }
    }

    @Override
    public void deleteMessage(String messageId, String userId) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isEmpty()) {
            throw new ResourceNotFoundException("Message not found");
        }

        Message message = messageOptional.get();
        Map<String, LocalDateTime> deleteBy = message.getDeleteBy();
        deleteBy.put(userId, LocalDateTime.now());
        message.setContentAfterRecallOrDeleteOrEdit(messageOptional.get().getContent());
        message.setContent("Tin nhắn đã bị xóa");
        message.setDeleteBy(deleteBy);

        messageRepository.save(message);
        log.info("Message deleted: {} for sender: {}", messageId, message.getSenderId());
    }

    @Override
    public MessageResponse forwardMessage(String messageId, String userId, String receiverId, String groupId) {
        validateUser(userId, receiverId);
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isEmpty()) {
            throw new ResourceNotFoundException("Message not found");
        }
        if (groupId != null) {
            if (groupRepository.findById(groupId).isEmpty()) {
                throw new ResourceNotFoundException("Group not found");
            }
        }

        Message forwardMessage = new Message();
        forwardMessage.setSenderId(userId);
        forwardMessage.setReceiverId(receiverId);
        forwardMessage.setGroupId(groupId);
        forwardMessage.setContent(messageOptional.get().getContent());
        forwardMessage.setType(MessageType.FORWARD); // Đặt type là FORWARD
        forwardMessage.setImageUrls(messageOptional.get().getImageUrls());
        forwardMessage.setVideoInfos(messageOptional.get().getVideoInfos());
        forwardMessage.setFileName(messageOptional.get().getFileName());
        forwardMessage.setThumbnail(messageOptional.get().getThumbnail());
        forwardMessage.setPublicId(messageOptional.get().getPublicId());
        forwardMessage.setReplyToMessageId(messageOptional.get().getReplyToMessageId());
        forwardMessage.setStatus(MessageStatus.SENT);
        forwardMessage.setCreatedAt(LocalDateTime.now());
        forwardMessage.setUpdatedAt(LocalDateTime.now());
        forwardMessage.setRead(false);
        forwardMessage.setPinned(false);
        forwardMessage.setForwardedFrom(new MessageReference(messageId, messageOptional.get().getSenderId(), LocalDateTime.now()));

        // Lưu tin nhắn
        Message savedMessage = messageRepository.save(forwardMessage);

        log.info("Message forwarded: {} for sender: {}", messageId, userId);
        return convertToMessageResponse(savedMessage);
    }

    @Override
    public void readMessage(String messageId, String receiverId) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isPresent()) {
            Message message = messageOptional.get();
            if (message.getReceiverId().equals(receiverId)) {
                message.setRead(true);
                messageRepository.save(message);
                log.info("Message read: {} for sender: {}", messageId, receiverId);
            } else {
                throw new ResourceNotFoundException("Only receiver have permission to read this message");
            }
        } else {
            throw new ResourceNotFoundException("Message not found");
        }
    }

    @Override
    public void editMessage(String messageId, String userId, String content) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isEmpty()) {
            throw new ResourceNotFoundException("Message not found");
        }

        Message message = messageOptional.get();
        if (message.isRecalled()) {
            throw new ResourceNotFoundException("Message is recalled");
        }

        if (message.getDeleteBy() == null) {
            throw new ResourceNotFoundException("Message is deleted");
        }

        if (message.getSenderId().equals(userId)) {
            message.setContentAfterRecallOrDeleteOrEdit(messageOptional.get().getContent());
            message.setContent(content);
            message.setEditId(true);
            messageRepository.save(message);
            log.info("Message edited: {} for sender: {}", messageId, userId);
        } else {
            throw new ResourceNotFoundException("Only sender have permission to edit this message");
        }
    }

    @Override
    public void pinMessage(String messageId, String userId) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isEmpty()) {
            throw new ResourceNotFoundException("Message not found");
        }
        messageOptional.get().setPinned(true);
        messageOptional.get().setPinnedAt(LocalDateTime.now());

        messageRepository.save(messageOptional.get());

        log.info("Message pinned: {} for sender: {}", messageId, userId);
    }

    @Override
    public void unpinMessage(String messageId, String userId) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isEmpty()) {
            throw new ResourceNotFoundException("Message not found");
        }
        messageOptional.get().setPinned(false);
        messageOptional.get().setPinnedAt(null);
        messageRepository.save(messageOptional.get());

        log.info("Message unpinned: {} for sender: {}", messageId, userId);
    }

    @Override
    public List<MessageResponse> getPinnedMessages(String otherUserId, String groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = userRepository.findByUsername(authentication.getName()).getId();

        List<Message> pinnedMessages;
        if (groupId != null) {
            validateGroup(groupId, userId);
            pinnedMessages = messageRepository.findByGroupIdAndIsPinned(groupId, true);
        } else {
            validateUser(userId, otherUserId);
            pinnedMessages = messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdAndIsPinned(userId, otherUserId, userId, otherUserId, true);
        }

        return pinnedMessages
                .stream()
                .map(this::convertToMessageResponse)
                .sorted(Comparator.comparing(MessageResponse::getCreateAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageResponse> searchMessages(String userId, String otherUserId, String groupId, String keyword) {
        if (groupId != null) {
            validateGroup(groupId, userId);
            return messageRepository.findByGroupIdAndContentContaining(groupId, keyword)
                    .stream()
                    .filter(msg ->
                            (msg.getContent() != null && msg.getContent().contains(keyword))
                                    || (msg.getFileName() != null && msg.getFileName().contains(keyword)))
                    .map(this::convertToMessageResponse)
                    .sorted(Comparator.comparing(MessageResponse::getCreateAt).reversed())
                    .collect(Collectors.toList());
        } else {
            validateUser(userId, otherUserId);
            return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(userId, otherUserId, userId, otherUserId)
                    .stream()
                    .filter(msg ->
                            (msg.getContent() != null && msg.getContent().toLowerCase().contains(keyword.toLowerCase()))
                                    || (msg.getFileName() != null && msg.getFileName().toLowerCase().contains(keyword.toLowerCase()))
                    )
                    .map(this::convertToMessageResponse)
                    .sorted(Comparator.comparing(MessageResponse::getCreateAt).reversed())
                    .collect(Collectors.toList());
        }
    }


    @Override
    public MessageResponse convertToMessageResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getSenderId(),
                message.getReceiverId(),
                message.getGroupId(),
                message.getContent(),
                message.getType(),
                message.getImageUrls(),
                message.getVideoInfos(),
                message.getFileName(),
                message.getReplyToMessageId(),
                message.getThumbnail(),
                message.getPublicId(),
                message.isRecalled(),
                message.getDeleteBy() != null ? new ArrayList<>(message.getDeleteBy().keySet()) : null,
                message.getStatus(),
                message.getForwardedFrom() != null ? new MessageReference(
                        message.getForwardedFrom().getMessageId(), message.getForwardedFrom().getOriginalSenderId(), message.getForwardedFrom().getForwardedAt()) : null,
                message.isRead(),
                message.getCreatedAt(),
                message.getUpdatedAt(),
                message.isPinned(),
                message.getPinnedAt()
        );
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
        if (userReceiver.get().getBlocks().contains(senderId)) {
            throw new ResourceNotFoundException("User blocked you");
        }
        if (userSender.get().getBlocks().contains(receiverId)) {
            throw new ResourceNotFoundException("You blocked user");
        }
    }

    private void validateGroup(String groupId, String senderId) {
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isEmpty()) {
            throw new ResourceNotFoundException("Group not found");
        }
        if (!group.get().getMemberIds().contains(senderId)) {
            throw new ResourceNotFoundException("User not in group");
        }
    }

    private boolean isValidUrl(String url) {
        try {
            new URL(url).toURI();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    private String extractVersionFromUrl(String secureUrl) {
        if (secureUrl == null) {
            return null;
        }

        Pattern pattern = Pattern.compile("/v(\\d+)/");
        Matcher matcher = pattern.matcher(secureUrl);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;

    }
    }


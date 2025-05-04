package vn.edu.iuh.fit.zalo_app_be.service.impl;

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

import java.time.LocalDateTime;
import java.util.*;
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
        log.info("Saving message from {} to {}: {}", request.getSenderId(), request.getReceiverId(), request.getContent());
        try {
            Message message = new Message();
            message.setSenderId(request.getSenderId());
            message.setReceiverId(request.getReceiverId());
            message.setGroupId(request.getGroupId());
            message.setContent(request.getContent());
            message.setType(request.getType() != null ? request.getType() : MessageType.TEXT);
            message.setImageUrls(request.getImageUrls());
            message.setVideoInfos(request.getVideoInfos());
            message.setReplyToMessageId(request.getReplyToMessageId());
            message.setForwardedFrom(request.getForwardedFrom() != null ? new MessageReference(
                    request.getForwardedFrom().getMessageId(), request.getForwardedFrom().getOriginalSenderId()) : null);
            message.setThumbnail(request.getThumbnail());
            message.setStatus(MessageStatus.SENT);
            message.setCreatedAt(LocalDateTime.now());
            message.setUpdatedAt(LocalDateTime.now());
            message.setRead(false);
            message.setTempId(request.getTempId()); // Lưu tempId

            Message savedMessage = messageRepository.save(message);
            log.info("Message saved from {} to {}: {}", request.getSenderId(), request.getReceiverId(), request.getContent());
            return convertToMessageResponse(savedMessage);
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

            String publicId = "chat_files/" + sanitizedFileName + fileExtension;

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", resourceType, "folder", "chat_files", "public_id", publicId));
            String url = (String) uploadResult.get("secure_url");
            String cloudinaryPublicId = (String) uploadResult.get("public_id");
            String thumbnail = (type == MessageType.VIDEO || type == MessageType.AUDIO) ? (String) uploadResult.get("thumbnail") : null;

            Map resourceInfo = cloudinary.api().resource(cloudinaryPublicId, ObjectUtils.asMap("resource_type", resourceType));
            if (resourceInfo == null || !url.equals(resourceInfo.get("secure_url"))) {
                throw new ResourceNotFoundException("Upload file not found on Cloudinary");
            }

            Message message = new Message();
            message.setSenderId(request.getSenderId());
            message.setReceiverId(request.getReceiverId());
            message.setType(type);
            message.setContent(url);
            message.setThumbnail(thumbnail);
            message.setPublicId(cloudinaryPublicId);
            message.setFileName(originalFileName);
            message.setReplyToMessageId(request.getReplyToMessageId());
            message.setStatus(MessageStatus.SENT);
            message.setCreatedAt(LocalDateTime.now());
            message.setUpdatedAt(LocalDateTime.now());
            message.setRead(false);
            message.setTempId(request.getTempId()); // Lưu tempId

            messageRepository.save(message);
            log.info("File uploaded: {} with origin name: {} for sender: {}", originalFileName, originalFileName, request.getSenderId());

            return Map.of(
                    "url", url,
                    "type", type.toString(),
                    "thumbnail", thumbnail != null ? thumbnail : "",
                    "fileName", originalFileName,
                    "publicId", cloudinaryPublicId != null ? cloudinaryPublicId : ""
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
                .filter(message -> message.getDeleteBy() == null || !message.getDeleteBy().containsKey(currentUser))
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
                .filter(message -> message.getDeleteBy() == null || !message.getDeleteBy().containsKey(currentUser))
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
            message.setContentAfterRecallOrDelete(messageOptional.get().getContent());
            message.setContent("Tin nhắn đã được thu hồi");
            message.setUpdatedAt(LocalDateTime.now());
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
        if (deleteBy == null) {
            deleteBy = new HashMap<>();
        }
        deleteBy.put(userId, LocalDateTime.now());
        message.setContentAfterRecallOrDelete(messageOptional.get().getContent());
        message.setContent("Tin nhắn đã bị xóa");
        message.setDeleteBy(deleteBy);
        message.setUpdatedAt(LocalDateTime.now());

        messageRepository.save(message);
        log.info("Message deleted: {} for sender: {}", messageId, message.getSenderId());
    }

    @Override
    public void forwardMessage(String messageId, String userId, String receiverId) {
        validateUser(userId, receiverId);
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isEmpty()) {
            throw new ResourceNotFoundException("Message not found");
        }

        Message message = messageOptional.get();

        Message forwardedMessage = new Message();
        forwardedMessage.setSenderId(userId);
        forwardedMessage.setReceiverId(receiverId);
        forwardedMessage.setContent(message.getContent());
        forwardedMessage.setType(MessageType.FORWARD);
        forwardedMessage.setImageUrls(message.getImageUrls());
        forwardedMessage.setVideoInfos(message.getVideoInfos());
        forwardedMessage.setForwardedFrom(new MessageReference(messageId, message.getSenderId()));
        forwardedMessage.setStatus(MessageStatus.SENT);
        forwardedMessage.setCreatedAt(LocalDateTime.now());
        forwardedMessage.setUpdatedAt(LocalDateTime.now());
        forwardedMessage.setRead(false);

        messageRepository.save(forwardedMessage);
        log.info("Message forwarded: {} for sender: {}", messageId, userId);
    }

    @Override
    public String findMessageIdByTempId(String tempId) {
        Optional<Message> messageOptional = messageRepository.findByTempId(tempId);
        if (messageOptional.isEmpty()) {
            throw new ResourceNotFoundException("Message not found for tempId: " + tempId);
        }
        return messageOptional.get().getId();
    }

    @Override
    public MessageResponse convertToMessageResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getTempId(),
                message.getSenderId(),
                message.getReceiverId(),
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
                        message.getForwardedFrom().getMessageId(), message.getForwardedFrom().getOriginalSenderId()) : null,
                message.isRead(),
                message.getCreatedAt(),
                message.getUpdatedAt()
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
}
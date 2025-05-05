/*
 * @ (#) Message.java       1.0     4/16/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.model;
/*
 * @author: Luong Tan Dat
 * @date: 4/16/2025
 */

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import vn.edu.iuh.fit.zalo_app_be.common.MessageStatus;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Document(collection = "messages")
@AllArgsConstructor
@NoArgsConstructor
public class Message {
    private String id;
    @Indexed
    private String senderId;
    @Indexed
    private String receiverId;
    private String groupId;
    private String content;
    private MessageType type;
    private boolean recalled = false;
    private List<String> imageUrls;
    private List<Map<String, String>> videoInfos; // For video {url, thumbnail}
    private Map<String, LocalDateTime> deleteBy; // {userId , time}
    private MessageReference forwardedFrom; // For forwarded message {messageId, originalSenderId}
    private String fileName; // original name of file
    private String thumbnail; // thumbnail of video
    private String publicId; // public id of file in cloudinary
    private String contentAfterRecallOrDelete; // content after recall or delete
    private boolean isPinned = false; // pinned message
    private LocalDateTime pinnedAt;
    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    private MessageStatus status = MessageStatus.SENT;
    private boolean isRead = false;
    private String replyToMessageId;

}


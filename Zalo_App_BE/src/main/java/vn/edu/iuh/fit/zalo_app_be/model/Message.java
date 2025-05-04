package vn.edu.iuh.fit.zalo_app_be.model;

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
    private List<Map<String, String>> videoInfos;
    private Map<String, LocalDateTime> deleteBy;
    private MessageReference forwardedFrom;
    private String fileName;
    private String thumbnail;
    private String publicId;
    private String contentAfterRecallOrDelete;
    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    private MessageStatus status = MessageStatus.SENT;
    private boolean isRead = false;
    private String replyToMessageId;
    private String tempId; // Thêm trường tempId
}
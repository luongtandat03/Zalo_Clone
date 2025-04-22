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
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "messages")
@AllArgsConstructor
public class Message {
    private String id;
    private String senderId;
    private String receiverId;
    private String content;
    private MessageType type;
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    private boolean isRead;

    public Message(String senderId, String recipientId, String content, MessageType type, LocalDateTime createAt, LocalDateTime updateAt) {
        this.senderId = senderId;
        this.receiverId = recipientId;
        this.content = content;
        this.type = type;
        this.createdAt = createAt;
        this.updatedAt = updateAt;
    }

}

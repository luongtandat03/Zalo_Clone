/*
 * @ (#) MessageRequest.java       1.0     4/17/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller.request;
/*
 * @author: Luong Tan Dat
 * @date: 4/17/2025
 */

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;
import vn.edu.iuh.fit.zalo_app_be.model.MessageReference;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Setter
@Getter
@NoArgsConstructor
public class MessageRequest {
    private String id;
    private String senderId;
    private String receiverId;
    private String content;
    private String groupId;
    private MessageType type;
    private List<String> imageUrls;
    private List<Map<String, String>> videoInfos;
    private String replyToMessageId;
    private String thumbnail;
    private MessageReference forwardedFrom;
    private List<String> deletedByUsers;
    private boolean recalled;
    private boolean isPinned;
    private LocalDateTime pinnedAt;
    private MessageResponse response;

    public MessageRequest(String senderId, String receiverId, String groupId, MessageType messageType, MessageResponse response) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.groupId = groupId;
        this.type = messageType;
        this.response = response;
    }
}

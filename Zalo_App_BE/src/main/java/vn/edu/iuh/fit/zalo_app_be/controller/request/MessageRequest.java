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
import lombok.Setter;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;
import vn.edu.iuh.fit.zalo_app_be.model.MessageReference;

import java.util.List;
import java.util.Map;

@Setter
@Getter
public class MessageRequest {
    private String senderId;
    private String receiverId;
    private String content;
    private MessageType type;
    private List<String> imageUrls;
    private List<Map<String, String>> videoInfos;
    private String replyToMessageId;
    private MessageReference forwardedFrom;
    private List<String> deletedByUsers;
    private boolean recalled;
}

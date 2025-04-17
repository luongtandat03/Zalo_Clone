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

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import vn.edu.iuh.fit.zalo_app_be.common.MessageType;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class MessageRequest {
    private String senderId;
    private String receiverId;
    private String content;
    private MessageType type;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    public MessageRequest(String receiverId, String senderId, LocalDateTime updateAt, LocalDateTime createAt) {
        this.receiverId = receiverId;
        this.senderId = senderId;
        this.updateAt = updateAt;
        this.createAt = createAt;
    }
}

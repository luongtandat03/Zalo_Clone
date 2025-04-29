/*
 * @ (#) MessageService.java       1.0     4/16/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service;

/*
 * @author: Luong Tan Dat
 * @date: 4/16/2025
 */

import org.springframework.web.multipart.MultipartFile;
import vn.edu.iuh.fit.zalo_app_be.controller.request.MessageRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;

import java.util.List;

public interface MessageService {
    void saveMessage(MessageRequest request);
    String uploadFile(MultipartFile files, MessageRequest request);
    List<MessageResponse> getChatHistory(String userId, String userOtherId);
    void recallMessage(String messageId, String userId);
    void deleteMessage(String messageId, String userId);
    void forwardMessage(String messageId, String userId, String receiverId);
}

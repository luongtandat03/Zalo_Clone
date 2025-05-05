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
import vn.edu.iuh.fit.zalo_app_be.model.Message;

import java.util.List;
import java.util.Map;

public interface MessageService {
    MessageResponse saveMessage(MessageRequest request);

    Map<String,String> uploadFile(MultipartFile files, MessageRequest request);

    List<MessageResponse> getChatHistory(String userOtherId);

    List<MessageResponse> getGroupChatHistory(String groupId);

    void recallMessage(String messageId, String userId);

    void deleteMessage(String messageId, String userId);

    void forwardMessage(String messageId, String userId, String receiverId);

    void readMessage(String messageId, String receiverId);

    MessageResponse convertToMessageResponse(Message message);
}

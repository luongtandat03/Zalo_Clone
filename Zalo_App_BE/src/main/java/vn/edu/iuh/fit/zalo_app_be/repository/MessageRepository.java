/*
 * @ (#) MessageRepository.java       1.0     4/16/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.edu.iuh.fit.zalo_app_be.model.Message;

import java.util.List;

/*
 * @author: Luong Tan Dat
 * @date: 4/16/2025
 */

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(String senderId, String receiverId, String receiverId1, String senderId1);

    List<Message> findByGroupId(String groupId);

    List<Message> findByGroupIdAndIsPinned(String groupId, boolean isPinned);

    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdAndIsPinned(String userId, String otherUserId, String userId1, String otherUserId1, boolean isPinned);

    List<Message> findByGroupIdAndContentContaining(String groupId, String keyword);
}

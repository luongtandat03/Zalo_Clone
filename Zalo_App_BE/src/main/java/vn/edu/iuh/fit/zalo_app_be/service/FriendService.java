/*
 * @ (#) FriendService.java       1.0     4/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service;

/*
 * @author: Luong Tan Dat
 * @date: 4/20/2025
 */


import vn.edu.iuh.fit.zalo_app_be.model.Friend;
import vn.edu.iuh.fit.zalo_app_be.model.User;

import java.util.List;

public interface FriendService {
    List<Friend> getPendingFriendRequests();

    List<User> getFriends();

    void sendFriendRequest(String receiverId);

    void acceptFriendRequest(String receiverId);

    void cancelFriendRequest(String receiverId);

    void deleteFriend(String friendId);

    void blockUser(String blockedUserId);

    void unblockUser(String blockedUserId);
}

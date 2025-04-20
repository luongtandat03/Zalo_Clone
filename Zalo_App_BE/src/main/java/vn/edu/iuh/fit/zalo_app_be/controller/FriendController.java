/*
 * @ (#) FriendController.java       1.0     4/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller;
/*
 * @author: Luong Tan Dat
 * @date: 4/20/2025
 */

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.zalo_app_be.controller.response.FriendResponse;
import vn.edu.iuh.fit.zalo_app_be.model.Friend;
import vn.edu.iuh.fit.zalo_app_be.model.User;
import vn.edu.iuh.fit.zalo_app_be.service.FriendService;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/friend")
@Slf4j(topic = "FRIEND-CONTROLLER")
public class FriendController {
    private final FriendService friendService;

    @PostMapping("/send-request/{receiverId}")
    @Operation(summary = "Send friend request", description = "Send a friend request to another user")
    public ResponseEntity<Map<String, String>> sendFriendRequest(@PathVariable String receiverId) {
        log.info("Sending friend request to {}", receiverId);
        friendService.sendFriendRequest(receiverId);
        return ResponseEntity.ok(Map.of("message", "Friend request sent"));
    }

    @GetMapping("/requests/pending")
    @Operation(summary = "Get pending friend requests", description = "Retrieve all pending friend requests for the current user")
    public ResponseEntity<List<Friend>> getPendingFriendRequests() {
        log.info("Fetching pending friend requests");
        return ResponseEntity.status(HttpStatus.OK).body(friendService.getPendingFriendRequests());
    }

    @GetMapping
    @Operation(summary = "Get friends list", description = "Retrieve the list of friends for the current user")
    public ResponseEntity<List<FriendResponse>> getFriends() {
        log.info("Fetching friends list");
        return ResponseEntity.status(HttpStatus.OK).body(friendService.getAllFriends());
    }

    @PostMapping("/request/{requestId}/accept")
    @Operation(summary = "Accept friend request", description = "Accept a friend request")
    public ResponseEntity<Map<String, String>> acceptFriendRequest(@PathVariable String requestId) {
        log.info("Accepting friend request with ID {}", requestId);
        friendService.acceptFriendRequest(requestId);
        return ResponseEntity.ok(Map.of("message", "Friend request accepted"));
    }
}

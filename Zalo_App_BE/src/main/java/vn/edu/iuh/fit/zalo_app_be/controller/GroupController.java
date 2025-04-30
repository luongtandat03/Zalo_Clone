/*
 * @ (#) GroupController.java       1.0     4/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller;
/*
 * @author: Luong Tan Dat
 * @date: 4/30/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.zalo_app_be.common.Roles;
import vn.edu.iuh.fit.zalo_app_be.controller.request.GroupRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.GroupResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.MessageResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.UserResponse;
import vn.edu.iuh.fit.zalo_app_be.model.User;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;
import vn.edu.iuh.fit.zalo_app_be.service.GroupService;
import vn.edu.iuh.fit.zalo_app_be.service.UserService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/group")
@Slf4j(topic = "GROUP-CONTROLLER")
public class GroupController {
    private final GroupService groupService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(@RequestBody GroupRequest groupRequest) {
        log.info("Creating group with name: {}", groupRequest.getName());
        return new ResponseEntity<>(groupService.createGroup(groupRequest), HttpStatus.CREATED);
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupResponse> addMember(@PathVariable String groupId, @RequestBody List<String> userIds) {
        log.info("Adding user {} to group: {}", userIds, groupId);
        return new ResponseEntity<>(groupService.addMember(groupId, userIds), HttpStatus.OK);
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<GroupResponse> removeMember(@PathVariable String groupId, @PathVariable String userId) {
        log.info("Removing user {} from group: {}", userId, groupId);
        return new ResponseEntity<>(groupService.removeMember(groupId, userId), HttpStatus.OK);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> dissolveGroup(@PathVariable String groupId) {
        log.info("Dissolving group: {}", groupId);
        groupService.dissolveGroup(groupId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{groupId}/roles/{userId}")
    public ResponseEntity<GroupResponse> assignRole(@PathVariable String groupId, @PathVariable String userId, @RequestParam Roles role) {
        log.info("Assigning role {} to user {} in group: {}", role, userId, groupId);
        return new ResponseEntity<>(groupService.assignRole(groupId, userId, role), HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GroupResponse>> getUserGroups(@PathVariable String userId) {
        log.info("Fetching groups for user: {}", userId);
        return new ResponseEntity<>(groupService.getGroupByUser(userId), HttpStatus.OK);
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<UserResponse>> getUserInGroup(@PathVariable String groupId) {
        log.info("Fetching members of group: {}", groupId);
        GroupResponse groupResponse = groupService.getUserInGroup(groupId);
        List<UserResponse> user = userService.findUsersByIds(groupResponse.getMemberIds());
        return new ResponseEntity<>(user, HttpStatus.OK);
    }
}

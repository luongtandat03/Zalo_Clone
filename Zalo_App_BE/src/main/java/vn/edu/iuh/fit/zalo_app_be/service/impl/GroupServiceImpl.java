/*
 * @ (#) GroupServiceImpl.java       1.0     4/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service.impl;
/*
 * @author: Luong Tan Dat
 * @date: 4/30/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.zalo_app_be.common.Roles;
import vn.edu.iuh.fit.zalo_app_be.controller.request.GroupRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.GroupResponse;
import vn.edu.iuh.fit.zalo_app_be.exception.ResourceNotFoundException;
import vn.edu.iuh.fit.zalo_app_be.model.Group;
import vn.edu.iuh.fit.zalo_app_be.model.User;
import vn.edu.iuh.fit.zalo_app_be.repository.GroupRepository;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;
import vn.edu.iuh.fit.zalo_app_be.service.GroupService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "GROUP-SERVICE")
public class GroupServiceImpl implements GroupService {
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Override
    public GroupResponse createGroup(GroupRequest request) {
        validateUser(request.getCreateId());
        Group group = new Group();
        group.setName(request.getName());
        group.setCreateId(request.getCreateId());
        group.setMemberIds(request.getMemberIds());
        group.setRoles(request.getRoles());
        group.setCreateAt(request.getCreateAt());
        group.setUpdateAt(request.getUpdateAt());
        group.setActive(true);

        groupRepository.save(group);

        log.info("Group created: {}", group);

        return convertToGroupResponse(group);
    }

    @Override
    public GroupResponse addMember(String groupId, String userId, String requesterId) {
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isEmpty()) {
            throw new ResourceNotFoundException("Group not found");
        }
        validateUser(userId);
        validateAdmin(group.get(), requesterId);

        if (!group.get().getMemberIds().contains(userId)) {
            group.get().getMemberIds().add(userId);
            group.get().getRoles().put(userId, Roles.MEMBER);

            groupRepository.save(group.get());

            log.info("User {} added to group {}", userId, groupId);

            return convertToGroupResponse(group.get());
        } else {
            throw new ResourceNotFoundException("User already in the group");
        }
    }

    @Override
    public GroupResponse removeMember(String groupId, String userId, String requesterId) {
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isEmpty()) {
            throw new ResourceNotFoundException("Group not found");
        }
        validateAdmin(group.get(), requesterId);

        if (group.get().getMemberIds().contains(userId)) {
            group.get().getMemberIds().remove(userId);
            group.get().getRoles().remove(userId);

            groupRepository.save(group.get());

            log.info("User {} removed from group {}", userId, groupId);

            return convertToGroupResponse(group.get());
        } else {
            throw new ResourceNotFoundException("User not in the group");
        }
    }

    @Override
    public void dissolveGroup(String groupId, String requesterId) {
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isEmpty()) {
            throw new ResourceNotFoundException("Group not found");
        }
        group.get().setActive(false);
        groupRepository.save(group.get());
        log.info("Group {} dissolved by {}", groupId, requesterId);
    }

    @Override
    public GroupResponse assignRole(String groupId, String userId, Roles role, String requesterId) {
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isEmpty()) {
            throw new ResourceNotFoundException("Group not found");
        }

        validateAdmin(group.get(), requesterId);

        if (!group.get().getMemberIds().contains(userId)) {
            throw new ResourceNotFoundException("User not in the group");
        }

        group.get().getRoles().put(userId, role);

        groupRepository.save(group.get());

        log.info("User {} assigned role {} in group {}", userId, role, groupId);
        return convertToGroupResponse(group.get());
    }

    @Override
    public List<GroupResponse> getGroupByUser(String userId) {
        return groupRepository.findByMemberIdsContaining(userId)
                .stream()
                .filter(Group::isActive)
                .map(this::convertToGroupResponse)
                .collect(Collectors.toList());
    }

    private void validateUser(String userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }
    }

    private void validateAdmin(Group group, String userId) {
        if (!group.getRoles().getOrDefault(userId, Roles.valueOf("")).equals(Roles.ADMIN)) {
            throw new ResourceNotFoundException("Only admin can perform this action");
        }
    }

    private GroupResponse convertToGroupResponse(Group group) {
        return GroupResponse.builder()
                .name(group.getName())
                .createId(group.getCreateId())
                .memberIds(group.getMemberIds())
                .roles(group.getRoles())
                .createAt(group.getCreateAt())
                .updateAt(group.getUpdateAt())
                .isActive(group.isActive())
                .build();
    }
}

/*
 * @ (#) CallServiceImpl.java       1.0     5/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service.impl;
/*
 * @author: Luong Tan Dat
 * @date: 5/6/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.zalo_app_be.common.CallStatus;
import vn.edu.iuh.fit.zalo_app_be.common.CallType;
import vn.edu.iuh.fit.zalo_app_be.controller.response.CallResponse;
import vn.edu.iuh.fit.zalo_app_be.exception.ResourceNotFoundException;
import vn.edu.iuh.fit.zalo_app_be.model.Call;
import vn.edu.iuh.fit.zalo_app_be.model.Group;
import vn.edu.iuh.fit.zalo_app_be.repository.CallRepository;
import vn.edu.iuh.fit.zalo_app_be.repository.GroupRepository;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;
import vn.edu.iuh.fit.zalo_app_be.service.CallService;
import vn.edu.iuh.fit.zalo_app_be.service.WebSocketService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CALL-SERVICE")
public class CallServiceImpl implements CallService {
    private final GroupRepository groupRepository;
    private final CallRepository callRepository;
    private final UserRepository userRepository;
    private final WebSocketService webSocketService;

    @Override
    public void initiateCall(String callerId, String receiverId, CallType callType, String groupId, Object spdOffer) {
        if (userRepository.findById(callerId).isEmpty()) {
            throw new ResourceNotFoundException("User not found with id: " + callerId);
        }
        if (receiverId == null || userRepository.findById(receiverId).isEmpty()) {
            throw new ResourceNotFoundException("User not found with id: " + receiverId);
        }
        if (groupId != null) {
            Optional<Group> groupOptional = groupRepository.findById(groupId);
            if (groupRepository.findById(groupId).isEmpty()) {
                throw new ResourceNotFoundException("Group not found with id: " + groupId);
            }
            if (groupOptional.get().isActive() || !groupOptional.get().getMemberIds().contains(callerId)) {
                throw new ResourceNotFoundException("Group is not active with id: " + groupId);
            }
        }

        Call call = new Call();
        call.setCallerId(callerId);
        call.setReceiverId(receiverId);
        call.setGroupId(groupId);
        call.setCallType(callType);
        call.setCallStatus(CallStatus.INITIATED);
        call.setStartAt(LocalDateTime.now());
        call.setParticipantIds(groupId != null ? new ArrayList<>(List.of(callerId)) : new ArrayList<>(List.of(callerId, receiverId)));

        callRepository.save(call);

        log.info("Call initiated: {}", call);

        // Notify the receiver about the call
        if (groupId != null) {
            Optional<Group> groupOptional = groupRepository.findById(groupId);
            if (groupOptional.isEmpty()) {
                throw  new ResourceNotFoundException("Group not found with id: " + groupId);
            }
            webSocketService.notifyGroupInitiated(call.getId(), callType, callerId, groupOptional.get(), spdOffer);
        }
    }

    @Override
    public void answerCall(String callId, String receiverId, Object spdAnswer) {

    }


    @Override
    public void endCall(String callId, String userId) {

    }

    @Override
    public void sendIceCandidate(String callId, String receiverId, Object candidate) {

    }

    @Override
    public List<Call> getCallHistory() {
        return List.of();
    }

    public CallResponse convertToMessageResponse(Call call) {
        return new CallResponse(
                call.getId(),
                call.getCallerId(),
                call.getCallType(),
                call.getReceiverId(),
                call.getGroupId(),
                call.getParticipantIds(),
                call.getCallStatus(),
                call.getStartAt(),
                call.getEndAt(),
                call.getUpdatedAt()
        );
    }
}

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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public Call initiateCall(String callerId, String receiverId, CallType callType, String groupId, Object spdOffer) {
        validateCall(callerId, receiverId, groupId);

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
                throw new ResourceNotFoundException("Group not found with id: " + groupId);
            }
            webSocketService.notifyGroupInitiated(call.getId(), callType, callerId, groupOptional.get(), spdOffer);
        }else {
            webSocketService.notifyCallInitiated(call.getId(), callType, callerId, receiverId, spdOffer);
        }

        return call;
    }

    @Override
    public Call answerCall(String callId, String receiverId, Object spdAnswer) {
        Optional<Call> callOptional = callRepository.findById(callId);
        if (callOptional.isEmpty()) {
            throw new ResourceNotFoundException("Call not found with id: " + callId);
        }

        if (callOptional.get().getGroupId().isEmpty()) {
            if (!callOptional.get().getReceiverId().equals(receiverId)) {
                throw new ResourceNotFoundException("User not authorized to answer this call");
            }
        } else {
            Optional<Group> groupOptional = groupRepository.findById(callOptional.get().getGroupId());
            if (groupOptional.isEmpty()) {
                throw new ResourceNotFoundException("Group not found with id: " + callOptional.get().getGroupId());
            }
            if (!groupOptional.get().getMemberIds().contains(receiverId)) {
                throw new ResourceNotFoundException("User not authorized to answer this call");
            }
        }

        if (!callOptional.get().getParticipantIds().contains(receiverId)) {
            callOptional.get().getParticipantIds().add(receiverId);
        }

        callOptional.get().setCallStatus(CallStatus.ACTIVE);

        callRepository.save(callOptional.get());

        String callerId = callOptional.get().getCallerId();
        String groupId = callOptional.get().getGroupId();
        if (groupId != null) {
            Optional<Group> groupOptional = groupRepository.findById(groupId);
            if (groupOptional.isEmpty()) {
                throw new ResourceNotFoundException("Group not found with id: " + groupId);
            }
            webSocketService.notifyGroupCallAnswer(callId, callerId, groupOptional.get(), spdAnswer);
        } else {
            webSocketService.notifyCallAnswer(callId, callerId, spdAnswer);
        }

        return callOptional.get();
    }


    @Override
    public Call endCall(String callId, String userId) {
        Optional<Call> callOptional = callRepository.findById(callId);
        if (callOptional.isEmpty()) {
            throw new ResourceNotFoundException("Call not found with id: " + callId);
        }

        if (userRepository.findById(userId).isEmpty()) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        if (!callOptional.get().getParticipantIds().contains(userId)) {
            throw new ResourceNotFoundException("User not authorized to end this call");
        }

        callOptional.get().setCallStatus(CallStatus.ENDED);

        callOptional.get().setEndAt(LocalDateTime.now());

        callRepository.save(callOptional.get());

        String groupId = callOptional.get().getGroupId();

        if (groupId != null) {
            Optional<Group> groupOptional = groupRepository.findById(groupId);
            if (groupOptional.isEmpty()) {
                throw new ResourceNotFoundException("Group not found with id: " + groupId);
            }
            webSocketService.notifyGroupCallEnd(callId, userId, groupOptional.get());
            log.info("Call group ended: {}", callOptional.get());
        } else {
            webSocketService.notifyCallEnd(callId, userId);
            log.info("Call ended: {}", callOptional.get());
        }

        return callOptional.get();
    }

    @Override
    public void sendIceCandidate(String callId, String receiverId, Object candidate) {
        Optional<Call> callOptional = callRepository.findById(callId);
        if (callOptional.isEmpty()) {
            throw new ResourceNotFoundException("Call not found with id: " + callId);
        }
        if (callOptional.get().getGroupId().isEmpty()) {
            if (!callOptional.get().getReceiverId().equals(receiverId)) {
                throw new ResourceNotFoundException("User not authorized to send ICE candidate");
            }
        } else {
            Optional<Group> groupOptional = groupRepository.findById(callOptional.get().getGroupId());
            if (groupOptional.isEmpty()) {
                throw new ResourceNotFoundException("Group not found with id: " + callOptional.get().getGroupId());
            }
            if (!groupOptional.get().getMemberIds().contains(receiverId)) {
                throw new ResourceNotFoundException("User not authorized to send ICE candidate");
            }
        }

        String groupId = callOptional.get().getGroupId();
        if (groupId != null) {
            Optional<Group> groupOptional = groupRepository.findById(groupId);
            if (groupOptional.isEmpty()) {
                throw new ResourceNotFoundException("Group not found with id: " + groupId);
            }
            webSocketService.notifyGroupIceCandidate(callId, receiverId, groupOptional.get(), candidate);
            log.info("ICE candidate sent group: {}", candidate);
        } else {
            webSocketService.notifyIceCandidate(callId, receiverId, candidate);
            log.info("ICE candidate sent: {}", candidate);
        }
    }

    @Override
    public List<Call> getCallHistory(String userId) {
        if (userRepository.findById(userId).isEmpty()) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        List<Call> callHistory = callRepository.findByCallerIdOrParticipantIdsContaining(userId, userId);
        log.info("Call history retrieved for user {}: {}", userId, callHistory);
        return callHistory;
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

    private void validateCall(String callerId, String receiverId, String groupId) {
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
    }
}

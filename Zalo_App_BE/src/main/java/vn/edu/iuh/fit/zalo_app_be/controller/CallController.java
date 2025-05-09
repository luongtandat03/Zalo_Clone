/*
 * @ (#) CallController.java       1.0     5/7/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller;
/*
 * @author: Luong Tan Dat
 * @date: 5/7/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.iuh.fit.zalo_app_be.common.CallType;
import vn.edu.iuh.fit.zalo_app_be.model.Call;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;
import vn.edu.iuh.fit.zalo_app_be.service.CallService;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j(topic = "CALL-CONTROLLER")
public class CallController {
    private final CallService callService;
    private final UserRepository userRepository;

    @MessageMapping("/call.audio")
    public ResponseEntity<Call> initiateCall(@Payload Map<String, Object> request) {
        String callerId = (String) request.get("callerId");
        String receiverId = (String) request.get("receiverId");
        String groupId = (String) request.get("groupId");
        Object sdpOffer = request.get("sdpOffer");
        CallType callType = groupId != null ? CallType.GROUP_CALL : CallType.CALL;

        log.info("Initiating call from {} to {} with groupId: {}", callerId, receiverId, groupId);

        try {
            log.info("Initiating call: callType={}, callerId={}, receiverId={}, groupId={}", callType, callerId, receiverId, groupId);
            return ResponseEntity.status(HttpStatus.OK).body(callService.initiateCall(callerId, receiverId, callType, groupId, sdpOffer));
        } catch (Exception ex) {
            log.error("Error initiating call: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @MessageMapping("/call.video")
    public ResponseEntity<Call> initiateVideoCall(@Payload Map<String, Object> request) {
        String callerId = (String) request.get("callerId");
        String receiverId = (String) request.get("receiverId");
        String groupId = (String) request.get("groupId");
        Object sdpOffer = request.get("sdpOffer");
        CallType callType = groupId != null ? CallType.GROUP_VIDEO_CALL : CallType.VIDEO_CALL;

        log.debug("Initiating video call: callType={}, callerId={}, receiverId={}, groupId={}", callType, callerId, receiverId, groupId);
        try {
            log.info("Initiating video call from {} to {} with groupId: {}", callerId, receiverId, groupId);
            return ResponseEntity.status(HttpStatus.OK).body(callService.initiateCall(callerId, receiverId, callType,groupId, sdpOffer));
        } catch (Exception e) {
            log.error("Lỗi khởi tạo video call: callType={}, callerId={}, receiverId={}, groupId={}, lỗi={}", callType, callerId, receiverId, groupId, e.getMessage());
            throw e;
        }
    }

    @MessageMapping("/call.answer")
    public ResponseEntity<Call> answerCall(@Payload Map<String, Object> request) {
        String callId = (String) request.get("callId");
        String receiverId = (String) request.get("receiverId");
        Object sdpAnswer = request.get("sdpAnswer");

        log.info("Answering call: callId={}, receiverId={}", callId, receiverId);
        try {
            return ResponseEntity.status(HttpStatus.OK).body(callService.answerCall(callId, receiverId, sdpAnswer));
        } catch (Exception e) {
            log.error("Error answering call: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @MessageMapping("/call.end")
    public ResponseEntity<Call> endCall(@Payload Map<String, Object> request) {
        String callId = (String) request.get("callId");
        String userId = (String) request.get("userId");

        log.info("Ending call: callId={}, userId={}", callId, userId);
        try {
            return ResponseEntity.status(HttpStatus.OK).body(callService.endCall(callId, userId));
        } catch (Exception e) {
            log.error("Error ending call: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @MessageMapping("/call.ice")
    public ResponseEntity<Void> sendIceCandidate(@Payload Map<String, Object> request) {
        String callId = (String) request.get("callId");
        String receiverId = (String) request.get("receiverId");
        Object candidate = request.get("candidate");

        log.info("Sending ICE candidate: callId={}, receiverId={}", callId, receiverId);
        try {
            callService.sendIceCandidate(callId, receiverId, candidate);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (Exception e) {
            log.error("Error sending ICE candidate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Call>> getCallHistory(@PathVariable String userId) {
        log.info("Fetching call history for userId: {}", userId);
        try {
            List<Call> callHistory = callService.getCallHistory(userId);
            return ResponseEntity.status(HttpStatus.OK).body(callHistory);
        } catch (Exception e) {
            log.error("Error fetching call history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}

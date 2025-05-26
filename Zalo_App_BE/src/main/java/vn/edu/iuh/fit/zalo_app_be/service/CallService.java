/*
 * @ (#) CallService.java       1.0     5/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service;

/*
 * @author: Luong Tan Dat
 * @date: 5/6/2025
 */

import vn.edu.iuh.fit.zalo_app_be.common.CallType;
import vn.edu.iuh.fit.zalo_app_be.model.Call;

import java.util.List;

public interface CallService {
    // Initiate a call
    Call initiateCall(String callerId, String receiverId, CallType callType, String groupId, Object spdOffer);
    // Answer a call
    Call answerCall(String callId, String receiverId, Object spdAnswer);
    // End a call
    Call endCall(String callId, String userId);
    // Send ICE candidate
    void sendIceCandidate(String callId, String receiverId, Object candidate);
    // Get call history
    List<Call> getCallHistory(String userId);
}

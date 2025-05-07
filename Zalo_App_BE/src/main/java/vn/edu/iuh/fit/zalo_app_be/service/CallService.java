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
    void initiateCall(String callerId, String receiverId, CallType callType, String groupId, Object spdOffer);
    // Answer a call
    void answerCall(String callId, String receiverId, Object spdAnswer);
    // End a call
    void endCall(String callId, String userId);
    // Send ICE candidate
    void sendIceCandidate(String callId, String receiverId, Object candidate);
    // Get call history
    List<Call> getCallHistory();
}

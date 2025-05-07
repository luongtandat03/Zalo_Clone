/*
 * @ (#) CallResponse.java       1.0     5/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller.response;
/*
 * @author: Luong Tan Dat
 * @date: 5/6/2025
 */


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import vn.edu.iuh.fit.zalo_app_be.common.CallStatus;
import vn.edu.iuh.fit.zalo_app_be.common.CallType;

import java.time.LocalDateTime;
import java.util.List;

@Setter
@Getter
@Builder
@AllArgsConstructor
public class CallResponse {
    private String id;
    private String callerId;
    private CallType callType;
    private String receiverId;
    private String groupId;
    private List<String> participantIds; // List of participants in the call
    private CallStatus callStatus;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private LocalDateTime updatedAt;

}

/*
 * @ (#) Call.java       1.0     5/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.model;
/*
 * @author: Luong Tan Dat
 * @date: 5/6/2025
 */

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import vn.edu.iuh.fit.zalo_app_be.common.CallStatus;
import vn.edu.iuh.fit.zalo_app_be.common.CallType;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "calls")
public class Call {
    @Id
    private String id;
    private String callerId;
    private CallType callType;
    private String receiverId;
    private String groupId;
    private List<String> participantIds; // List of participants in the call
    private CallStatus callStatus;

    @CreatedDate
    @Indexed
    private LocalDateTime startAt;

    private LocalDateTime endAt;

    @LastModifiedDate
    @Indexed
    private LocalDateTime updatedAt;

}

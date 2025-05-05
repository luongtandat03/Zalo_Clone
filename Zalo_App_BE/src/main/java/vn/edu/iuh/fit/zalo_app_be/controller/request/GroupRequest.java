/*
 * @ (#) GroupRequest.java       1.0     4/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller.request;
/*
 * @author: Luong Tan Dat
 * @date: 4/30/2025
 */

import lombok.Getter;
import vn.edu.iuh.fit.zalo_app_be.common.Roles;

import java.util.List;
import java.util.Map;

@Getter
public class GroupRequest {
    private String id;
    private String name;
    private String createId;
    private List<String> memberIds;
    private Map<String, Roles> roles;
    private String avatarGroup;
    private boolean isActive;
}

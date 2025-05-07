/*
 * @ (#) VerifyEmailRequest.java       1.0     4/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller.request;
/*
 * @author: Luong Tan Dat
 * @date: 4/30/2025
 */

import lombok.Getter;

@Getter
public class VerifyEmailRequest {
    private String email;
    private String code;
    private UserRegisterRequest userRegisterRequest;
}

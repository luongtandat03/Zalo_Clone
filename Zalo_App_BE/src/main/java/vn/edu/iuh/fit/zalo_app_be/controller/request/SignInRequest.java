/*
 * @ (#) SignInRequest.java       1.0     4/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller.request;
/*
 * @author: Luong Tan Dat
 * @date: 4/9/2025
 */

import lombok.Getter;

@Getter
public class SignInRequest {
    private String username;
    private String password;
    private String platform;
    private String versionApp;
    private String deviceToken;
}

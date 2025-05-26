/*
 * @ (#) AuthenticationService.java       1.0     4/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service;

/*
 * @author: Luong Tan Dat
 * @date: 4/9/2025
 */

import vn.edu.iuh.fit.zalo_app_be.controller.request.SignInRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.SignInResponse;

public interface AuthenticationService {
    SignInResponse getAccessToken(SignInRequest request);
    SignInResponse getRefreshToken(String refreshToken);
}

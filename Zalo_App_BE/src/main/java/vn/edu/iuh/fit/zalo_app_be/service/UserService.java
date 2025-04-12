/*
 * @ (#) UserService.java       1.0     4/8/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service;
/*
 * @author: Luong Tan Dat
 * @date: 4/8/2025
 */

import org.springframework.security.core.userdetails.UserDetails;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserPasswordRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserRegisterRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserUpdateRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.RegisterResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.UserPasswordResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.UserResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.UserUpdateResponse;

public interface UserService {
    RegisterResponse register(UserRegisterRequest request);
    UserUpdateResponse updateUser(UserUpdateRequest request);
    UserDetails loadUserByUsername(String username);
    UserPasswordResponse updatePassword(UserPasswordRequest request);
    UserResponse getUserCurrent();
}

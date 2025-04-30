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
import org.springframework.web.multipart.MultipartFile;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserPasswordRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserRegisterRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserUpdateRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.*;

import java.util.List;

public interface UserService {
    RegisterResponse register(UserRegisterRequest request);

    UserUpdateResponse updateUser(UserUpdateRequest request, MultipartFile file);

    UserDetails loadUserByUsername(String username);

    UserPasswordResponse updatePassword(UserPasswordRequest request);

    UserResponse getUserCurrent();

    LogoutResponse logoutUserCurrent(String token);

    void requestPasswordReset(String email);

    void resetPassword(String token, String newPassword);

    List<UserResponse> findUsersByIds(List<String> ids);
}

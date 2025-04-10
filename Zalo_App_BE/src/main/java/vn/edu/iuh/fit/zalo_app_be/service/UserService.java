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
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserRegisterRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserUpdateRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.RegisterResponse;
import vn.edu.iuh.fit.zalo_app_be.model.User;

import java.util.Optional;

public interface UserService {
    RegisterResponse register(UserRegisterRequest request);
    Optional<User> updateUser(UserUpdateRequest request);
    UserDetails loadUserByUsername(String username);
}

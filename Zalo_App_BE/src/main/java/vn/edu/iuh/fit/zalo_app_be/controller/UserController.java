/*
 * @ (#) UserController.java       1.0     4/8/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller;
/*
 * @author: Luong Tan Dat
 * @date: 4/8/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserPasswordRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserUpdateRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.UserPasswordResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.UserResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.UserUpdateResponse;
import vn.edu.iuh.fit.zalo_app_be.service.UserService;

@RestController
@Slf4j(topic = "USER-CONTROLLER")
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @GetMapping("/get-info-for-user")
    public UserResponse getUserFromUsername() {
        log.info("Get user info request");

        return userService.getUserCurrent();
    }

    @PostMapping("/user/update")
    public UserUpdateResponse updateUser(@RequestBody UserUpdateRequest request) {
        log.info("Update user request: {}", request.getEmail());

        return userService.updateUser(request);
    }

    @PostMapping("/change-password")
    public UserPasswordResponse changePassword(@RequestBody UserPasswordRequest request) {
        log.info("Change password request: {}", request);

        return userService.updatePassword(request);
    }
}

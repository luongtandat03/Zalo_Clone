/*
 * @ (#) AuthenticationController.java       1.0     4/8/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller;
/*
 * @author: Luong Tan Dat
 * @date: 4/8/2025
 */

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.iuh.fit.zalo_app_be.controller.request.SignInRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserPasswordRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserRegisterRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.RegisterResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.SignInResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.UserPasswordResponse;
import vn.edu.iuh.fit.zalo_app_be.model.User;
import vn.edu.iuh.fit.zalo_app_be.service.AuthenticationService;
import vn.edu.iuh.fit.zalo_app_be.service.UserService;

import java.util.Optional;

@RestController
@Slf4j(topic = "AUTHENTICATION-CONTROLLER")
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "Login to the application", description = "This endpoint allows users to log in to the application.")
    public SignInResponse login(@RequestBody SignInRequest request) {
        log.info("Login request: {}", request);

        return authenticationService.getAccessToken(request);
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "This endpoint allows users to register a new account.")
    public RegisterResponse register(@RequestBody UserRegisterRequest request) {
        log.info("Register request: {}", request);

        return userService.register(request);
    }

    @PostMapping("/logout")
    public String logout() {
        return "Logout successful";
    }

    @PostMapping("/forgot-password")
    public String forgotPassword() {
        return "Forgot password successful";
    }


}

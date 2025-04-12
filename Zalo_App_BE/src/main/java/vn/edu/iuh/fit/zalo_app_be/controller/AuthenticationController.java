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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.iuh.fit.zalo_app_be.controller.request.SignInRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserPasswordRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserRegisterRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.RegisterResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.SignInResponse;
import vn.edu.iuh.fit.zalo_app_be.controller.response.UserPasswordResponse;
import vn.edu.iuh.fit.zalo_app_be.exception.UnauthorizedException;
import vn.edu.iuh.fit.zalo_app_be.model.User;
import vn.edu.iuh.fit.zalo_app_be.service.AuthenticationService;
import vn.edu.iuh.fit.zalo_app_be.service.UserService;

import java.util.Map;
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

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> requestResetPassword(@RequestBody Map<String, String> request){
        String email = request.get("email");
        log.info("Request reset password for email: {}", email);

        try{
            userService.requestPasswordReset(email);
            return ResponseEntity.ok(Map.of("message", "Reset password link sent to your email"));
        }catch (ResponseStatusException e) {
            log.error("Error processing password reset request for email {}: {}", email, e.getMessage());
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("error", e.getReason()));
        } catch (Exception e) {
            log.error("Unexpected error processing password reset request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send reset link"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String password = request.get("password");
        try {
            userService.resetPassword(token, password);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (UnauthorizedException | ResponseStatusException e) {
            log.error("Error resetting password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error resetting password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reset password"));
        }
    }
}

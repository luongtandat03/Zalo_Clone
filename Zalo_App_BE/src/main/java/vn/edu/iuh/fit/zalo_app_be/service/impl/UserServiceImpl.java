/*
 * @ (#) UserServiceImpl.java       1.0     4/10/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service.impl;
/*
 * @author: Luong Tan Dat
 * @date: 4/10/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.iuh.fit.zalo_app_be.common.TokenType;
import vn.edu.iuh.fit.zalo_app_be.common.UserStatus;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserPasswordRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserRegisterRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.request.UserUpdateRequest;
import vn.edu.iuh.fit.zalo_app_be.controller.response.*;
import vn.edu.iuh.fit.zalo_app_be.exception.DulicatedUserException;
import vn.edu.iuh.fit.zalo_app_be.exception.InvalidDataException;
import vn.edu.iuh.fit.zalo_app_be.exception.UnauthorizedException;
import vn.edu.iuh.fit.zalo_app_be.model.PasswordResetToken;
import vn.edu.iuh.fit.zalo_app_be.model.User;
import vn.edu.iuh.fit.zalo_app_be.repository.PasswordResetTokenRepository;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;
import vn.edu.iuh.fit.zalo_app_be.service.EmailService;
import vn.edu.iuh.fit.zalo_app_be.service.JwtService;
import vn.edu.iuh.fit.zalo_app_be.service.UserService;

import java.time.LocalDateTime;

@Service
@Slf4j(topic = "USER-SERVICE")
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RandomCodeGenerator randomCodeGenerator;

    @Override
    public RegisterResponse register(UserRegisterRequest request) {
        User user = userRepository.findByUsername(request.getUsername());
        if (user != null) {
            throw new DulicatedUserException("User already exists");
        }

        user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .phone(request.getPhone())
                .avatar(request.getAvatar())
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getUsername());

        return RegisterResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .status(UserStatus.ACTIVE)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public UserUpdateResponse updateUser(UserUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            log.error("No authenticated user found");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        String username = authentication.getName();

        User user = userRepository.findByUsername(username);
        if(user == null) {
            log.error("User not found with username: {}", username);
            throw new UsernameNotFoundException("User not found");
        }

        log.info("User loaded from DB with username: {} - id: {} ", user.getUsername(), user.getId());

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setGender(request.getGender());
        user.setBirthday(request.getBirthday());
        user.setAvatar(request.getAvatar());

        log.info("User {} updated", user.getId());
        user = userRepository.save(user);

        return UserUpdateResponse.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .gender(user.getGender())
                .birthday(user.getBirthday())
                .avatar(user.getAvatar())
                .status(user.getStatus())
                .username(user.getUsername())
                .createdAt(user.getCreatedAt())
                .updateAt(user.getUpdateAt())
                .build();
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return user;
    }

    @Override
    public UserPasswordResponse updatePassword(UserPasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", username);

        return UserPasswordResponse.builder()
                .message("Password changed successfully")
                .build();
    }

    @Override
    public UserResponse getUserCurrent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            log.error("No authenticated user found");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        User user = (User) authentication.getPrincipal();

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthday(user.getBirthday())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .status(user.getStatus())
                .avatar(user.getAvatar())
                .createdAt(user.getCreatedAt())
                .updateAt(user.getUpdateAt())
                .build();
    }

    @Override
    public LogoutResponse logoutUserCurrent(String token) {
        log.info("Logging out user with token: {}", token);
        String username;
        try {
            username = jwtService.extractUsername(token, TokenType.ACCESS_TOKEN);
        } catch (IllegalArgumentException e) {
            log.error("Invalid access token format: {}", e.getMessage());
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED, "Invalid access token format: " + e.getMessage());
        } catch (RuntimeException e) {
            log.error("Error extracting username from token: {}", e.getMessage());
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED, e.getMessage());
        }

        User user = userRepository.findByUsername(username);
        if (user == null) {
            log.error("Token is invalid or expired");
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED, "Token is invalid or expired");
        }

        jwtService.blackListToken(token, TokenType.ACCESS_TOKEN);
        log.info("Token blacklisted successfully for user: {}", username);
        return LogoutResponse.builder()
                .message("Logout successfully")
                .build();
    }

    @Override
    public void requestPasswordReset(String email) {
        log.info("Requesting password reset for email: {}", email);

        User user = userRepository.findByEmail(email);
        if (user == null) {
            log.error("User not found with email: {}", email);
            throw new InvalidDataException("User not found");
        }
        PasswordResetToken tokenReset = passwordResetTokenRepository.findByEmail(user.getEmail());
        if(tokenReset != null) {
            passwordResetTokenRepository.delete(tokenReset);
        }

        String code = randomCodeGenerator.generateCode();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(10);
        PasswordResetToken resetToken = new PasswordResetToken(code, email, expiryDate);
        passwordResetTokenRepository.save(resetToken);

        try{
            emailService.sendPasswordResetEmail(email,code);
        }catch (Exception e){
            log.error("Error while sending password reset email: {}", e.getMessage());
            passwordResetTokenRepository.delete(resetToken);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Error while sending password reset email");
        }
    }

    @Override
    public void resetPassword(String code, String newPassword) {
        log.info("Resetting password with code: {}", code);

        if (code == null || code.trim().isEmpty()) {
            log.error("Code is null");
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED, "Invalid reset token");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByCode(code);

        if (resetToken == null) {
            log.error("Reset token is null or empty");
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED, "Invalid reset token");
        }

        User user = userRepository.findByEmail(resetToken.getEmail());

        if (user == null) {
            log.error("User not found with email: {}", resetToken.getEmail());
            throw new InvalidDataException("User not found");
        }

        if (resetToken.isUsed()) {
            log.error("Reset token already used: {}", code);
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED, "Reset token already used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            log.error("Reset token expired: {}", code);
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED, "Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getUsername());
    }
}

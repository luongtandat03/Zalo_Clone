/*
 * @ (#) UserCreationRequest.java       1.0     4/10/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller.request;
/*
 * @author: Luong Tan Dat
 * @date: 4/10/2025
 */

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import vn.edu.iuh.fit.zalo_app_be.common.UserStatus;

@Getter
public class UserRegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;
    @NotBlank(message = "Password is required")
    private String password;
    @Email(message = "Email is not valid")
    private String email;
    @NotBlank(message = "Phone is required")
    private String phone;
    @NotBlank(message = "Avatar is required")
    private String avatar;
    private UserStatus status;
}

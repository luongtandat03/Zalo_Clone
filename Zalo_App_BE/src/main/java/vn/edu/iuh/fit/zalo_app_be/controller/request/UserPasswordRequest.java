/*
 * @ (#) UserPasswordRequest.java       1.0     4/10/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller.request;
/*
 * @author: Luong Tan Dat
 * @date: 4/10/2025
 */

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class UserPasswordRequest {
    private String oldPassword;
    private String newPassword;
}

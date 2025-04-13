/*
 * @ (#) PasswordResetToken.java       1.0     4/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.model;
/*
 * @author: Luong Tan Dat
 * @date: 4/12/2025
 */

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    private String id;
    private String code;
    private String email;
    private LocalDateTime expiryDate;
    private boolean used;

    public PasswordResetToken(String code, String email, LocalDateTime expiryDate) {
        this.code = code;
        this.email = email;
        this.expiryDate = expiryDate;
        this.used = false;
    }
}

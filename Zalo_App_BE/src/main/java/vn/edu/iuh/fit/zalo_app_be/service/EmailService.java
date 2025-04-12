/*
 * @ (#) EmailService.java       1.0     4/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service;
/*
 * @author: Luong Tan Dat
 * @date: 4/12/2025
 */

public interface EmailService {
    void sendPasswordResetEmail(String email, String token);
}

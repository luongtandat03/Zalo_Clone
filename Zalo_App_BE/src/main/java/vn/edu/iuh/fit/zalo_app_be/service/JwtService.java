/*
 * @ (#) JwtService.java       1.0     4/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service;
/*
 * @author: Luong Tan Dat
 * @date: 4/9/2025
 */

import org.springframework.security.core.GrantedAuthority;
import vn.edu.iuh.fit.zalo_app_be.common.TokenType;

import java.util.Collection;

public interface JwtService {
    String generateAccessToken(String userId, String username);

    String generateRefreshToken(String userId, String username);

    String generateResetToken(String userId);

    String extractUsername(String token, TokenType tokenType);

    void blackListToken(String token, TokenType type);
}

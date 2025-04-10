/*
 * @ (#) JwtServiceImpl.java       1.0     4/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service.impl;
/*
 * @author: Luong Tan Dat
 * @date: 4/9/2025
 */

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.zalo_app_be.common.TokenType;
import vn.edu.iuh.fit.zalo_app_be.exception.InvalidDataException;
import vn.edu.iuh.fit.zalo_app_be.service.JwtService;

import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import static vn.edu.iuh.fit.zalo_app_be.common.TokenType.ACCESS_TOKEN;
import static vn.edu.iuh.fit.zalo_app_be.common.TokenType.REFRESH_TOKEN;

@Service
@Slf4j(topic = "JWT-SERVICE")
public class JwtServiceImpl implements JwtService {
    @Value("${jwt.expiryMinutes}")
    private long expiryMinutes;

    @Value("${jwt.expiryDay}")
    private long expiryDay;

    @Value("${jwt.accessKey}")
    private String accessKey;

    @Value("${jwt.refreshKey}")
    private String refreshKey;

    @Override
    public String generateAccessToken(String userId, String username) {
        log.info("Generating access token for user: {} ", username);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);

        return generateToken(claims, username);
    }

    @Override
    public String generateRefreshToken(String userId, String username) {
        log.info("Generating refresh token for user: {}", username);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);

        return generateRefreshToken(claims, username);
    }

    @Override
    public String extractUsername(String token, TokenType type) {
        log.info("Extracting username from token: {} of type: {}", token, type);

        return extractClaims(type, token, Claims::getSubject);

    }

    private <T> T extractClaims(TokenType type, String token, Function<Claims, T> claimsExtractor) {
        log.info("--------------[ extractClaims ]--------------");
        final Claims claims = extractAllClaim(type, token);
        return claimsExtractor.apply(claims);
    }

    private Claims extractAllClaim(TokenType type, String token) {
        log.info("--------------[ extractAllClaim ]--------------");
        try {
            return Jwts.parserBuilder().setSigningKey(getKey(type)).build().parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            throw new AccessDeniedException("Access Denied, error: " + e.getMessage());
        }
    }

    private String generateToken(Map<String, Object> claims, String username) {
        log.info("Generating token for subject: {} with claims: {}", username, claims);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * expiryMinutes))
                .signWith(getKey(ACCESS_TOKEN))
                .compact();
    }

    private String generateRefreshToken(Map<String, Object> claims, String username) {
        log.info("Generating refresh token for subject: {} with claims: {}", username, claims);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * expiryDay))
                .signWith(getKey(REFRESH_TOKEN))
                .compact();
    }

    private Key getKey(TokenType type) {
        switch (type) {
            case ACCESS_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(accessKey));
            }
            case REFRESH_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(refreshKey));
            }
            default -> throw new InvalidDataException("Invalid token type");
        }
    }

}

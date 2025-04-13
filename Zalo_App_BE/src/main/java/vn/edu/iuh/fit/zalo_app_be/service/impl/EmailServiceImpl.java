/*
 * @ (#) EmailServiceImpl.java       1.0     4/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service.impl;
/*
 * @author: Luong Tan Dat
 * @date: 4/12/2025
 */

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.zalo_app_be.service.EmailService;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "EMAIL-SERVICE")
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender javaMailSender;
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void sendPasswordResetEmail(String email, String code) {
        String subject = "Reset Your Password";
        String content = "Please Enter the code below to reset your password:\n" +
                code + "\n\nThis link will expire in 10 minutes.";

        try{
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(content);
            javaMailSender.send(message);
            log.info("Password reset email sent to: {}", email);
        }catch (MessagingException e){
            log.error("Error while creating email message: {}", e.getMessage());
            throw new RuntimeException("Failed to create email message", e);
        }
    }
}

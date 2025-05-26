/*
 * @ (#) UserServiceDetail.java       1.0     4/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.service;
/*
 * @author: Luong Tan Dat
 * @date: 4/9/2025
 */

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.zalo_app_be.repository.UserRepository;

@Service
public record UserServiceDetail(UserRepository userRepository) {
    public UserDetailsService userDetailsService() {
        return userRepository::findByUsername;
    }
}

/*
 * @ (#) UserController.java       1.0     4/8/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.controller;
/*
 * @author: Luong Tan Dat
 * @date: 4/8/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j(topic = "USER-CONTROLLER")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/user")
    public String getUser() {
        return "User information";
    }

    @PostMapping("/user/update")
    public String updateUser() {
        return "User updated successfully";
    }
}

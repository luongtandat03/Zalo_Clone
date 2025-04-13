/*
 * @ (#) PasswordResetTokenRepository.java       1.0     4/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.edu.iuh.fit.zalo_app_be.model.PasswordResetToken;

/*
 * @author: Luong Tan Dat
 * @date: 4/12/2025
 */

@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    PasswordResetToken findByEmail(String email);

    PasswordResetToken findByCode(String code);
}

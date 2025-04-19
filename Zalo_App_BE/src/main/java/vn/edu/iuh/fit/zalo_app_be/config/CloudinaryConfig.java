/*
 * @ (#) CloudinaryConfig.java       1.0     4/17/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.config;
/*
 * @author: Luong Tan Dat
 * @date: 4/17/2025
 */

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary(
            @Value("${cloudinary.cloud.name}") String cloudName,
            @Value("${cloudinary.cloud.api-key}") String apiKey,
            @Value("${cloudinary.cloud.api-secret}") String apiSecret
    ) {
        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
        return cloudinary;
    }
}

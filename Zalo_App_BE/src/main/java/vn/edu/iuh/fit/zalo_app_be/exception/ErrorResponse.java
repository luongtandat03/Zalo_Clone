/*
 * @ (#) ErrorResponse.java       1.0     3/29/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.exception;
/*
 * @author: Luong Tan Dat
 * @date: 3/29/2025
 */

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class ErrorResponse {
    private Date timestamp;
    private int status;
    private String path;
    private String error;
    private String message;

}

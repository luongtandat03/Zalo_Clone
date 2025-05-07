package vn.edu.iuh.fit.zalo_app_be.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageReference{
    private String messageId;
    private String originalSenderId;
}

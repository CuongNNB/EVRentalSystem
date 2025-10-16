package com.evrental.evrentalsystem.response.user;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RenterDetailResponse {
    private Integer userId;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private String verificationStatus;
    private Boolean isRisky;
    // đường dẫn tạm để client có thể tải ảnh
    private String cccdFrontUrl;
    private String cccdBackUrl;
    private String driverLicenseUrl;
}

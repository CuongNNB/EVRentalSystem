package com.evrental.evrentalsystem.response.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponse {
    private Integer userId;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private String address;
    private LocalDateTime createdAt;
    private String cccdFront;
    private String cccdBack;
    private String driverLicense;
    private String token;
}

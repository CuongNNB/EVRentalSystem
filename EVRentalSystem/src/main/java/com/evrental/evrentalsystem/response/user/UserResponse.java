package com.evrental.evrentalsystem.response.user;

import lombok.Getter;
import lombok.Setter;

/**
 * Response object for returning safe user data
 * (does not include password)
 */
@Getter
@Setter
public class UserResponse {
    private Integer userId;
    private String username;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String role;
    private String status;
}

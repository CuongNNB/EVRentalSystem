package com.evrental.evrentalsystem.response.user;

import lombok.Getter;
import lombok.Setter;

/**
 * Response object for login result
 */
@Getter
@Setter
public class UserLoginResponse {
    private String token;   // Fake or JWT
    private UserResponse user;
}

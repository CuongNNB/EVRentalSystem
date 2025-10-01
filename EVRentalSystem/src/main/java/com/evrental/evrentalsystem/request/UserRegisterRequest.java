package com.evrental.evrentalsystem.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String phone;
    private String email;
    private String address;
}

package com.evrental.evrentalsystem.response.user;

import lombok.Data;
@Data
public class UpdateUserProfile {
    private String fullName;
    private String phone;
    private String email;
    private String address;
}

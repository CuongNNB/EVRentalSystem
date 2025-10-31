package com.evrental.evrentalsystem.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStaffRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String position;
    private int stationId;
}

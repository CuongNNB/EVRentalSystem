package com.evrental.evrentalsystem.response.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetAllAdminResponse {
    private Integer userId;
    private String username;
    private String fullName;
    private String role;
}

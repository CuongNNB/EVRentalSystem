package com.evrental.evrentalsystem.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRenterDetailRequest {
    private Integer userId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String status;
    private Boolean isRisky;
    private String verificationStatus;
}
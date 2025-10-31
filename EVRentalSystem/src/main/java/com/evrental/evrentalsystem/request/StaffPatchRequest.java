package com.evrental.evrentalsystem.request;

import lombok.Data;

@Data
public class StaffPatchRequest {
    private String email;
    private String phone;
    private String status;
}

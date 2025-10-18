package com.evrental.evrentalsystem.request;
import lombok.Data;

@Data
public class UserUpdateInspectionStatusRequest {
    private Integer bookingId;
    private String status;
}

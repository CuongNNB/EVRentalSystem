package com.evrental.evrentalsystem.request;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateVehicleStatusRequest {
    private String status;
}

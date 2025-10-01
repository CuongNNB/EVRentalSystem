package com.evrental.evrentalsystem.response.vehicle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleDetailResponse {
    private String licensePlate;
    private String color;
    private String batteryCapacity;
    private Integer odo;
}
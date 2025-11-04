package com.evrental.evrentalsystem.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCreateVehicleDetailRequest {
    private String licensePlate;
    private String batteryCapacity;
    private Integer odo;
    private String picture;
    private String color;
    private Integer stationId;
    private Integer vehicleModelId;
}

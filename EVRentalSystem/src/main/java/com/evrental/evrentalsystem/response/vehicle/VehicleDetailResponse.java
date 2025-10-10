package com.evrental.evrentalsystem.response.vehicle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleDetailResponse {
    private Integer id;
    private String licensePlate;
    private String brand;
    private String model;
    private String color;
    private String batteryCapacity;
    private String status;
    private String picture;
    private Integer odo;
    private String stationName;
}

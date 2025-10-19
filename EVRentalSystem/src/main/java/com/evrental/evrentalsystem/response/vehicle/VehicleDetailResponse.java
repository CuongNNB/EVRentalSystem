package com.evrental.evrentalsystem.response.vehicle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleDetailResponse {
    private Integer id;
    private Integer vehicleModelId;
    private String brand;
    private String model;
    private String color;
    private String batteryCapacity;
    private String status;
    private Integer odo;
    private String picture;
    private Integer stationId;
    private String stationName;
    private String stationAddress;
    private double price; //
}

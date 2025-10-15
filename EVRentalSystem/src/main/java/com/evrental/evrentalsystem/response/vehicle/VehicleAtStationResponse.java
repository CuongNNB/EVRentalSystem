package com.evrental.evrentalsystem.response.vehicle;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleAtStationResponse {
    private Integer vehicleId;          // ID của vehicleDetail
    private Integer modelId;
    private String brand;
    private String model;
    private Double price;               // giá thuê cơ bản
    private Integer seats;
    private String color;
    private String batteryCapacity;
    private Integer odo;
    private String picture;
    private String status;
}

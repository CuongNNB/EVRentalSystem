package com.evrental.evrentalsystem.response.vehicle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleDetailResponse {
    private Integer vehicleModelId;
    private String brand;
    private String model;
    private Double price;
    private Integer seats;
    private Long availableCount;
}

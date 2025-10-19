package com.evrental.evrentalsystem.response.vehicle;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleAtStationResponse {
    private Integer vehicleModelId;
    private String brand;
    private String model;
    private Double price;
    private Integer seats;
    private String modelPicture;
    private Integer availableCount;
}

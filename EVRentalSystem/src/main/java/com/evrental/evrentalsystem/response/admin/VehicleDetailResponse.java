package com.evrental.evrentalsystem.response.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleDetailResponse {

    private Integer id;
    private String licensePlate;
    private String status;
    private Integer odo;
    private String color;
    private String picture;

    private Integer stationId;
    private String stationName;

    private Integer vehicleId;
    private String brand;
    private String model;
}

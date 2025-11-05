package com.evrental.evrentalsystem.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response cho API GetAllVehicleDetailById (dành cho admin).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminGetAllVehicleDetailResponse {
    // model info
    private Integer modelId;
    private String brand;
    private String model;

    // detail info
    private Integer detailId;
    private String licensePlate;
    private String batteryCapacity;
    private Integer odo;
    private String detailPicture; // base64 string (as stored)
    private String status;
    private String color;

    // station info
    private Integer stationId;
    private String stationName;
}
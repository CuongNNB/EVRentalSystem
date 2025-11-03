package com.evrental.evrentalsystem.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response mapping for VehicleModel (sử dụng đúng kiểu dữ liệu theo entity).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminVehicleModelResponse {
    private Integer vehicleId;
    private String brand;
    private String model;
    private Double price;
    private Integer seats;
    private String modelPicture;

    private List<AdminVehicleDetailResponse> vehicleDetails;
}

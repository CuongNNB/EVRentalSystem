package com.evrental.evrentalsystem.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCreateVehicleModelRequest {
    private String brand;  // Thương hiệu xe
    private String model;  // Mẫu xe
    private Double price;  // Giá xe
    private Integer seats;  // Số ghế
}

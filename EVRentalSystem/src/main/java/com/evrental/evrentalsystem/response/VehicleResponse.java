package com.evrental.evrentalsystem.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho response khi trả về thông tin xe
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {
    private Integer id;
    private String brand;
    private String model;
    private BigDecimal price;
    private Integer seats;
    private String status; // ví dụ: "AVAILABLE" hoặc "UNAVAILABLE"
}

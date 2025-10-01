package com.evrental.evrentalsystem.response.vehicle;

import com.evrental.evrentalsystem.entity.VehicleDetail;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO cho response khi trả về thông tin xe
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class VehicleResponse {
    private Integer id;
    private String brand;
    private String model;
    private BigDecimal price;
    private Integer seats;
    private String status; // ví dụ: "AVAILABLE" hoặc "UNAVAILABLE"

    private List<VehicleDetailResponse> details;
}

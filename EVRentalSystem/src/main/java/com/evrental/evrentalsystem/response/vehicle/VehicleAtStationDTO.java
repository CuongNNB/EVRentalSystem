package com.evrental.evrentalsystem.response.vehicle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleAtStationDTO {
    private Integer id;
    private String brand;
    private String model;
    private BigDecimal price;
    private Integer seats;
    private String status;
    private Integer quantity;
}

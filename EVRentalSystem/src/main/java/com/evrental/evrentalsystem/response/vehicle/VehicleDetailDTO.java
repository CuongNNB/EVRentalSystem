package com.evrental.evrentalsystem.response.vehicle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleDetailDTO {
    private String licensePlate;
    private String brand;
    private String model;
    private String color;
    private String batteryCapacity;
    private String status;
    private Integer odo;
}

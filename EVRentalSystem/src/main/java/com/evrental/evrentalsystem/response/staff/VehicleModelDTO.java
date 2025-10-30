package com.evrental.evrentalsystem.response.staff;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleModelDTO {
    private Integer vehicleId;
    private String brand;
    private String model;
    private Double price;
    private Integer seats;
    private String picture;
}
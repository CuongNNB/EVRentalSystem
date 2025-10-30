package com.evrental.evrentalsystem.response.staff;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDetailDTO {
    private Integer id;
    private String licensePlate;
    private String batteryCapacity;
    private Integer odo;
    private String picture;
    private String status;
    private String color;
    private Integer stationId;
}
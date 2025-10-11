package com.evrental.evrentalsystem.response.vehicle;
import lombok.Data;

@Data
public class VehicleWithIdResponse {
    // VehicleDetail sd
    private Integer id;
    private String licensePlate;
    private String color;
    private String batteryCapacity;
    private String status;
    private Integer odo;
    private String picture;

    // VehicleModel
    private Integer vehicleModelId;
    private String brand;
    private String model;
    private Integer seats;
    private Double price;

    // Station
    private Integer stationId;
    private String stationName;
    private String stationAddress;
    private String stationLocation;
}

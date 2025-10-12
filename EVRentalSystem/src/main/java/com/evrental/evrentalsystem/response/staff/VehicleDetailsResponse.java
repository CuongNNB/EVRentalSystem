package com.evrental.evrentalsystem.response.staff;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class VehicleDetailsResponse {
    int id;
    String modelName;
    String licensePlate;
    String color;
    String image;
    String battery;
    int odo;
}

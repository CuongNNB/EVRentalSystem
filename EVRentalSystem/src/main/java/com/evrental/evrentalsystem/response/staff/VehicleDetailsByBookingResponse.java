package com.evrental.evrentalsystem.response.staff;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class VehicleDetailsByBookingResponse {
    String licensePlate;
    String color;
    String batteryCapacity;
    int odo;
}

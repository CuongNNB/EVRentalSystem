package com.evrental.evrentalsystem.request;

import lombok.*;

@Getter @Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateVehicleRequest {
    private String  licensePlate;
    private String  status;          // AVAILABLE / RENTED / FIXING / ...
    private Integer odo;
    private String  color;
    private String  picture;

    private Integer stationId;       // đổi Station
    private Integer vehicleModelId;  // đổi VehicleModel
}

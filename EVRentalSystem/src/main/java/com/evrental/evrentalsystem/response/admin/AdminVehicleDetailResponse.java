package com.evrental.evrentalsystem.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminVehicleDetailResponse {
    private Integer id;
    private String licensePlate;
    private String batteryCapacity;
    private Integer odo;
    private String detailPicture;
    private String status;
    private String color;

    // station info
    private Integer stationId;
    private String stationName;
}

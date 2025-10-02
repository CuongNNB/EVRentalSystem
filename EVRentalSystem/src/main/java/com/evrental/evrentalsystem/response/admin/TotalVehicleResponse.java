package com.evrental.evrentalsystem.response.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TotalVehicleResponse {
    private Integer stationId;
    private String stationName;
    private String address;
    private String location;
    private Integer totalVehicles;
}

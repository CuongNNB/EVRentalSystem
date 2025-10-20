package com.evrental.evrentalsystem.response.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RentedVehicleResponse {
    private Integer stationId;
    private String stationName;
    private Long rentedVehicleCount;
}
//
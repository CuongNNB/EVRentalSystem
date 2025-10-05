package com.evrental.evrentalsystem.response.vehicle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleAtStationResponse {
    private Integer stationId;
    private String stationName;
    private String address;
    private String location;
    private List<VehicleDetailDTO> vehicles;
}

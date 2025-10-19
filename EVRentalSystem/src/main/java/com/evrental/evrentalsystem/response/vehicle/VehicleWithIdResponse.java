package com.evrental.evrentalsystem.response.vehicle;
import lombok.Data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleWithIdResponse {
    private Integer vehicleDetailId;
    private Integer stationId;
    private String stationName;
    private String stationAddress;
}

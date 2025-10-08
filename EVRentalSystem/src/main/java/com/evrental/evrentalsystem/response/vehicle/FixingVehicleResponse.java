package com.evrental.evrentalsystem.response.vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FixingVehicleResponse {
    private String stationName;
    private int totalFixingVehicles;
    private List<VehicleInfo> vehicles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleInfo {
        private Integer id;
        private String licensePlate;
        private String color;
        private String batteryCapacity;
        private String model;
        private String status;
    }
}

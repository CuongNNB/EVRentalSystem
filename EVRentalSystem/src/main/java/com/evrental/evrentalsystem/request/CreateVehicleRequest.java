package com.evrental.evrentalsystem.request;

import lombok.Data;

@Data
public class CreateVehicleRequest {
    private String  licensePlate;     // ví dụ: "51A-99999" (nên unique)
    private Integer vehicleModelId;   // map tới Vehicle_Model.vehicle_id
    private Integer stationId;        // map tới Station.station_id
    private String  color;            // ví dụ: "Đen"
    private String  batteryCapacity;  // ví dụ: "42 kWh"
    private Integer odo;              // số km ban đầu
    private String  picture;          // ví dụ: "1.jpg"
    private String  status;           // AVAILABLE | RENTED | FIXING (mặc định AVAILABLE)
}

package com.evrental.evrentalsystem.repository.projection;

public interface VehicleListProjection {
    Integer getId();
    String  getLicensePlate();
    String  getModel();
    String  getBrand();
    String  getStatus();
    Integer getStationId();
    String  getStationName();
    Integer getOdo();

    // NEW
    Integer getVehicleId();   // ← alias: vehicleId
    String  getPicture();     // ← alias: picture
}

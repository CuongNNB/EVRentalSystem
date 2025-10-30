package com.evrental.evrentalsystem.repository.projection;

public interface VehicleListProjection {
    Integer getId();
    String  getLicensePlate();
    String  getModel();        // <= đổi từ getModelName() thành getModel()
    String  getBrand();
    String  getStatus();       // (vì bạn đang dùng String status)
    Integer getStationId();
    String  getStationName();
    Integer getOdo();
}

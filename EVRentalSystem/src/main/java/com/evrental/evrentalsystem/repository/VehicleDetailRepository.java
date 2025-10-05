package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.VehicleDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleDetailRepository extends JpaRepository<VehicleDetail, Integer> {
    List<VehicleDetail> findByStation_StationId(Integer stationId);
    VehicleDetail findByLicensePlate(String licensePlate);
}

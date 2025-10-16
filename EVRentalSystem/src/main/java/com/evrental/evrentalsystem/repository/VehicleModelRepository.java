package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleModelRepository extends JpaRepository<VehicleModel, Integer> {
    VehicleModel findByVehicleId(Integer vehicleId);
}

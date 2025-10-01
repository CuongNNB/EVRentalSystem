package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.VehicleInventory;
import com.evrental.evrentalsystem.entity.VehicleInventoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleInventoryRepository extends JpaRepository<VehicleInventory, VehicleInventoryId> {
    List<VehicleInventory> findByStationId(Integer stationId);
}
package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.VehicleInspection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleInspectionRepository extends JpaRepository<VehicleInspection, Integer> {
}

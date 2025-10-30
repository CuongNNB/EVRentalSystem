package com.evrental.evrentalsystem.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.evrental.evrentalsystem.repository.projection.VehicleListProjection;

public interface VehicleAdminService {
    Page<VehicleListProjection> getVehicleList(
            String q,
            String status,
            Integer stationId,
            String brand,
            String model,
            Pageable pageable
    );
}

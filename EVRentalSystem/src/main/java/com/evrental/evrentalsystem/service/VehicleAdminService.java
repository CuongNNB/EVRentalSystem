package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.request.UpdateVehicleRequest;
import com.evrental.evrentalsystem.response.admin.VehicleDetailResponse;
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
    VehicleDetailResponse getVehicleById(Integer id);

    void updateVehicle(Integer id, UpdateVehicleRequest req);

    void deleteVehicle(Integer id); // sẽ tuỳ chọn soft/hard bên impl
}

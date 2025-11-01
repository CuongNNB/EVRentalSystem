package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.projection.VehicleListProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Primary
@Service
@RequiredArgsConstructor
public class VehicleAdminServiceImpl implements VehicleAdminService {

    private final VehicleDetailRepository repo;

    @Override
    public Page<VehicleListProjection> getVehicleList(
            String q,
            String status,
            Integer stationId,
            String brand,
            String model,
            Pageable pageable
    ) {
        // DEBUG LOG — dùng để xác thực BE đã chạy đúng class này
        System.out.println(">>> [VehicleAdminServiceImpl] searchVehicleList() CALLED <<<");
        System.out.printf(
                ">>> Params -> q=%s | status=%s | stationId=%s | brand=%s | model=%s | page=%d | size=%d\n",
                q, status, stationId, brand, model, pageable.getPageNumber(), pageable.getPageSize()
        );

        return repo.searchVehicleList(
                normalize(q),
                normalize(status),
                stationId,
                normalize(brand),
                normalize(model),
                pageable
        );
    }

    private String normalize(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}

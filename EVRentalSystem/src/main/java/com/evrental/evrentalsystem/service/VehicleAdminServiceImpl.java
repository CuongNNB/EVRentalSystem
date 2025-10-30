package com.evrental.evrentalsystem.service;



import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.projection.VehicleListProjection;
import com.evrental.evrentalsystem.service.VehicleAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

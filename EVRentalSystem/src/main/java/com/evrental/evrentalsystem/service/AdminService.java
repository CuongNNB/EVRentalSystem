package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleInventoryRepository;
import com.evrental.evrentalsystem.request.TotalVehicleRequest;
import com.evrental.evrentalsystem.response.admin.TotalVehicleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final VehicleInventoryRepository vehicleInventoryRepository;
    private final StationRepository stationRepository;

    public TotalVehicleResponse getTotalVehicles(TotalVehicleRequest request) {
        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));

        Integer total = vehicleInventoryRepository.getTotalVehiclesByStation(request.getStationId());
        if (total == null) total = 0;

        return new TotalVehicleResponse(
                station.getId(),
                station.getStationName(),
                station.getAddress(),
                station.getLocation(),
                total
        );
    }
}

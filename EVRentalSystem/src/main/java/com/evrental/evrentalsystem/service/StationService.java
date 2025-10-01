package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleInventoryRepository;
import com.evrental.evrentalsystem.response.vehicle.VehicleAtStationDTO;
import com.evrental.evrentalsystem.response.vehicle.VehicleAtStationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;
    private final VehicleInventoryRepository vehicleInventoryRepository;

    public List<VehicleAtStationResponse> searchStationsByDistrict(String district) {
        List<Station> stations = stationRepository.findByAddressContainingIgnoreCase(district);

        return stations.stream().map(station -> {
            List<VehicleAtStationDTO> vehicles = vehicleInventoryRepository.findByStationId(station.getId())
                    .stream()
                    .map(inv -> new VehicleAtStationDTO(
                            inv.getVehicle().getId(),
                            inv.getVehicle().getBrand(),
                            inv.getVehicle().getModel(),
                            inv.getVehicle().getPrice(),
                            inv.getVehicle().getSeats(),
                            inv.getVehicle().getStatus(),
                            inv.getQuantity()
                    ))
                    .toList();

            return new VehicleAtStationResponse(
                    station.getId(),
                    station.getStationName(),
                    station.getAddress(),
                    station.getLocation(),
                    vehicles
            );
        }).toList();
    }
}


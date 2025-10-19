package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.response.vehicle.VehicleDetailDTO;
import com.evrental.evrentalsystem.response.vehicle.VehicleAtStationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {
    private final StationRepository stationRepository;
    private final VehicleDetailRepository vehicleDetailRepository;

    //Hàm tìm trạm theo quận
    public List<VehicleAtStationResponse> findStationsByDistrict(Integer stationId) {
        Optional<Station> stationOpt = stationRepository.findById(stationId);
        if (stationOpt.isEmpty()) {
            throw new IllegalArgumentException("Station with id " + stationId + " not found");
        }

        List<VehicleDetail> list = vehicleDetailRepository.findByStationIdAndStatus(stationId, "AVAILABLE");

        return list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private VehicleAtStationResponse toResponse(VehicleDetail v) {
        return VehicleAtStationResponse.builder()
                .vehicleId(v.getId())
                .modelId(v.getVehicleModel().getVehicleId())
                .brand(v.getVehicleModel().getBrand())
                .model(v.getVehicleModel().getModel())
                .price(v.getVehicleModel().getPrice())
                .seats(v.getVehicleModel().getSeats())
                .color(v.getVehicleModel().getColor())
                .batteryCapacity(v.getBatteryCapacity())
                .odo(v.getOdo())
                .picture(v.getPicture())
                .status(v.getStatus())
                .build();
    }
    //End code here
}


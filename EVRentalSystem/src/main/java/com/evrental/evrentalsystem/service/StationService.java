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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {
    private final StationRepository stationRepository;
    private final VehicleDetailRepository vehicleDetailRepository;

    //Hàm tìm trạm theo quận
    public List<VehicleAtStationResponse> findStationsByDistrict(String district) {
        List<Station> stations = stationRepository.findByDistrict(district);
        return stations.stream().map(station -> {
            List<VehicleDetail> vehicles = vehicleDetailRepository.findByStation(station);
            List<VehicleDetailDTO> vehicleDTOs = vehicles.stream().map(v -> new VehicleDetailDTO(
                    v.getLicensePlate(),
                    v.getVehicleModel().getBrand(),
                    v.getVehicleModel().getModel(),
                    v.getColor(),
                    v.getBatteryCapacity(),
                    v.getVehicleModel().getStatus(),
                    v.getOdo()
            )).collect(Collectors.toList());

            return new VehicleAtStationResponse(
                    station.getStationId(),
                    station.getStationName(),
                    station.getAddress(),
                    station.getLocation(),
                    vehicleDTOs
            );
        }).collect(Collectors.toList());
    }
    //End code here
}


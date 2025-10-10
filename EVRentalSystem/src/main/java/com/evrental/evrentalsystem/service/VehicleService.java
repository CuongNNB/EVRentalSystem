package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.response.vehicle.VehicleDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleDetailRepository vehicleDetailRepository;
    private final StationRepository stationRepository;

    //Hàm này dùng để lấy các danh sách xe có sẵn khi nhấn ở interface.
    public List<VehicleDetailResponse> getAvailableVehicles() {
        List<VehicleDetail> vehicles = vehicleDetailRepository.findByVehicleModelStatus("AVAILABLE");
        return vehicles.stream().map(v -> new VehicleDetailResponse(
                v.getId(),
                v.getLicensePlate(),
                v.getVehicleModel().getBrand(),
                v.getVehicleModel().getModel(),
                v.getColor(),
                v.getBatteryCapacity(),
                v.getStatus(),
                v.getOdo(),
                v.getStation().getStationName()
        )).collect(Collectors.toList());
    }


    //End code here
}
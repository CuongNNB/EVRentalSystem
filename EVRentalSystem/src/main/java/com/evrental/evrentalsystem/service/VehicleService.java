package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.response.vehicle.VehicleDetailResponse;
import com.evrental.evrentalsystem.response.vehicle.VehicleWithIdResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
//ửa
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
                v.getVehicleModel().getVehicleId(),
                v.getVehicleModel().getBrand(),
                v.getVehicleModel().getModel(),
                v.getVehicleModel().getColor(),
                v.getBatteryCapacity(),
                v.getStatus(),
                v.getOdo(),
                v.getPicture(),
                v.getStation().getStationId(),
                v.getStation().getStationName(),
                v.getStation().getAddress(),
                v.getVehicleModel().getPrice()
        )).collect(Collectors.toList());
    }
//
    public VehicleWithIdResponse getVehicleFullDetail(Integer id) {
        VehicleDetail v = vehicleDetailRepository.findDetailWithModelAndStation(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id=" + id));

        VehicleWithIdResponse res = new VehicleWithIdResponse();
        // VehicleDetail
        res.setId(v.getId());
        res.setLicensePlate(v.getLicensePlate());
        res.setColor(v.getVehicleModel().getColor());
        res.setBatteryCapacity(v.getBatteryCapacity());
        res.setStatus(v.getStatus());
        res.setOdo(v.getOdo());
        res.setPicture(v.getPicture());

        // VehicleModel
        if (v.getVehicleModel() != null) {
            res.setVehicleModelId(v.getVehicleModel().getVehicleId());
            res.setBrand(v.getVehicleModel().getBrand());
            res.setModel(v.getVehicleModel().getModel());
            res.setSeats(v.getVehicleModel().getSeats());
            res.setPrice(v.getVehicleModel().getPrice());
        }

        // Station
        if (v.getStation() != null) {
            res.setStationId(v.getStation().getStationId());
            res.setStationName(v.getStation().getStationName());
            res.setStationAddress(v.getStation().getAddress());
            res.setStationLocation(v.getStation().getLocation());
        }

        return res;
    }
    //End code here
}
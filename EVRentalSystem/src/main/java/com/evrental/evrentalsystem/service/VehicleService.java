package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Vehicle;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.VehicleRepository;
import com.evrental.evrentalsystem.response.vehicle.VehicleDetailResponse;
import com.evrental.evrentalsystem.response.vehicle.VehicleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // ✅ để Spring tạo constructor và inject VehicleRepository
public class VehicleService {

    private final VehicleRepository vehicleRepository; // phải là final
    private final VehicleDetailRepository vehicleDetailRepository;

    //Hàm này dùng để lấy các danh sách xe có sẵn khi nhấn ở interface.
    public List<VehicleResponse> getAvailableVehicles() {
        return vehicleRepository.findByStatus("AVAILABLE")
                .stream()
                .map(v -> VehicleResponse.builder()
                        .id(v.getId())
                        .brand(v.getBrand())
                        .model(v.getModel())
                        .price(v.getPrice())
                        .seats(v.getSeats())
                        .status(v.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    public VehicleResponse getVehicleDetail(Integer vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        List<VehicleDetailResponse> details = vehicleDetailRepository.findAll()
                .stream()
                .filter(d -> d.getVehicle().getId().equals(vehicleId))
                .map(d -> new VehicleDetailResponse(
                        d.getLicensePlate(),
                        d.getColor(),
                        d.getBatteryCapacity(),
                        d.getOdo()
                ))
                .toList();

        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getPrice(),
                vehicle.getSeats(),
                vehicle.getStatus(),
                details
        );
    }
}
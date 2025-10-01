package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.repository.VehicleRepository;
import com.evrental.evrentalsystem.response.VehicleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // ✅ để Spring tạo constructor và inject VehicleRepository
public class VehicleService {

    private final VehicleRepository vehicleRepository; // phải là final

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
}
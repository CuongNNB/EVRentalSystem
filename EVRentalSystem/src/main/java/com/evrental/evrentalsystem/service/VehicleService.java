package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.entity.VehicleModel;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.VehicleModelRepository;
import com.evrental.evrentalsystem.response.vehicle.VehicleDetailResponse;
import com.evrental.evrentalsystem.response.vehicle.VehicleWithIdResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
//ửa
@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleDetailRepository vehicleDetailRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final StationRepository stationRepository;
    private final ObjectMapper objectMapper; // Spring Boot cung cấp ObjectMapper bean


    //Hàm này dùng để lấy các danh sách xe có sẵn khi nhấn ở interface.
    public List<VehicleDetailResponse> getAvailableVehicles() {
        List<VehicleModel> models = vehicleModelRepository.findAll();

        return models.stream().map(m -> {
            long count = vehicleDetailRepository.countByVehicleModel_VehicleIdAndStatus(m.getVehicleId(), "AVAILABLE");
            return new VehicleDetailResponse(
                    m.getVehicleId(),
                    m.getBrand(),
                    m.getModel(),
                    m.getPrice(),
                    m.getSeats(),
                    m.getPicture(),
                    count
            );
        }).collect(Collectors.toList());
    }
    public List<VehicleWithIdResponse> getDetailsByVehicleModelId(Integer vehicleModelId) {
        List<VehicleDetail> details = vehicleDetailRepository.findByVehicleModelId(vehicleModelId);

        return details.stream()
                .map(vd -> new VehicleWithIdResponse(
                        vd.getId(),
                        vd.getStation().getStationId(),
                        vd.getStation().getStationName(),
                        vd.getStation().getAddress()
                ))
                .collect(Collectors.toList());
    }
    //End code here
}
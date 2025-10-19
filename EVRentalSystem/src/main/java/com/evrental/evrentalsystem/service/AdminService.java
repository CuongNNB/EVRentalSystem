package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.response.admin.RentedVehicleResponse;
import com.evrental.evrentalsystem.response.admin.TotalVehicleResponse;
import com.evrental.evrentalsystem.response.vehicle.FixingVehicleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class AdminService {
    private final StationRepository stationRepository;
    private final VehicleDetailRepository vehicleDetailRepository;

    //Hàm lấy tổng số xe tại 1 trạm cụ thể cho admin.
    public TotalVehicleResponse getTotalVehiclesByStation(Integer stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạm với ID: " + stationId));

        Long total = vehicleDetailRepository.countVehiclesByStationId(stationId);
        return new TotalVehicleResponse(station.getStationId(), station.getStationName(), total);
    }

    //Hàm lấy tổng số xe đang được thuê (RENTED) ở 1 trạm cụ thể cho ADMIN.
    public RentedVehicleResponse getRentedVehiclesByStation(Integer stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạm với ID: " + stationId));

        Long rented = vehicleDetailRepository.countRentedVehiclesByStationId(stationId);
        return new RentedVehicleResponse(station.getStationId(), station.getStationName(), rented);
    }

    //Hàm lấy các xe đang sửa
    public FixingVehicleResponse getFixingVehiclesByStation(Integer stationId) {
        var station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));

        var vehicles = vehicleDetailRepository.findFixingVehiclesByStation(stationId);

        var vehicleInfoList = vehicles.stream().map(v ->
                new FixingVehicleResponse.VehicleInfo(
                        v.getId(),
                        v.getLicensePlate(),
                        v.getVehicleModel().getColor(),
                        v.getBatteryCapacity(),
                        v.getVehicleModel().getModel(),
                        v.getStatus()
                )
        ).toList();

        return new FixingVehicleResponse(
                station.getStationName(),
                vehicleInfoList.size(),
                vehicleInfoList
        );
    }
    //
    //End code here
}

package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.VehicleModelRepository;
import com.evrental.evrentalsystem.response.vehicle.VehicleDetailDTO;
import com.evrental.evrentalsystem.response.vehicle.VehicleAtStationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {
    private final StationRepository stationRepository;
    private final VehicleDetailRepository vehicleDetailRepository;
    private final VehicleModelRepository vehicleModelRepository;


    //Hàm tìm trạm theo quận
    public List<VehicleAtStationResponse> getModelsByStation(Integer stationId) {
        List<Object[]> rows = vehicleModelRepository.findVehicleModelsByStation(stationId);
        List<VehicleAtStationResponse> list = new ArrayList<>();

        for (Object[] r : rows) {
            Integer vehicleModelId = r[0] != null ? ((Number) r[0]).intValue() : null;
            String brand = r[1] != null ? r[1].toString() : null;
            String model = r[2] != null ? r[2].toString() : null;
            Double price = r[3] != null ? ((Number) r[3]).doubleValue() : 0.0;
            Integer seats = r[4] != null ? ((Number) r[4]).intValue() : 0;
            String modelPicture = r[5] != null ? r[5].toString() : null;
            Integer availableCount = r[6] != null ? ((Number) r[6]).intValue() : 0;

            VehicleAtStationResponse dto = new VehicleAtStationResponse(
                    vehicleModelId, brand, model, price, seats, modelPicture, availableCount
            );
            list.add(dto);
        }

        return list;
    }
    //End code here
}


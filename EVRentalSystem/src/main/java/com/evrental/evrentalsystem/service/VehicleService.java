package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.entity.VehicleModel;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.VehicleModelRepository;
import com.evrental.evrentalsystem.response.staff.ModelWithDetailsDTO;
import com.evrental.evrentalsystem.response.staff.VehicleDetailDTO;
import com.evrental.evrentalsystem.response.staff.VehicleModelDTO;
import com.evrental.evrentalsystem.response.vehicle.VehicleDetailResponse;
import com.evrental.evrentalsystem.response.vehicle.VehicleWithIdResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
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

    public List<ModelWithDetailsDTO> getModelsWithDetailsByStation(Integer stationId) {
        // Lấy tất cả VehicleDetail thuộc stationId
        List<VehicleDetail> details = vehicleDetailRepository.findByStationStationId(stationId);

        // Nhóm theo vehicleModel
        Map<VehicleModel, List<VehicleDetail>> grouped = details.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(VehicleDetail::getVehicleModel));

        // Map sang DTO
        List<ModelWithDetailsDTO> result = new ArrayList<>();
        for (Map.Entry<VehicleModel, List<VehicleDetail>> entry : grouped.entrySet()) {
            VehicleModel vm = entry.getKey();
            List<VehicleDetail> detailList = entry.getValue();

            VehicleModelDTO vmDto = new VehicleModelDTO(
                    vm.getVehicleId(),
                    vm.getBrand(),
                    vm.getModel(),
                    vm.getPrice(),
                    vm.getSeats(),
                    vm.getPicture()
            );

            List<VehicleDetailDTO> detailDtos = detailList.stream()
                    .map(d -> new VehicleDetailDTO(
                            d.getId(),
                            d.getLicensePlate(),
                            d.getBatteryCapacity(),
                            d.getOdo(),
                            d.getPicture(),
                            d.getStatus().toString(),
                            d.getColor(),
                            d.getStation() != null ? d.getStation().getStationId() : null
                    ))
                    .collect(Collectors.toList());

            result.add(new ModelWithDetailsDTO(vmDto, detailDtos));
        }

        // Nếu muốn sắp xếp (ví dụ theo brand+model), có thể sort ở đây
        result.sort(Comparator.comparing(o -> Optional.ofNullable(o.getModel().getBrand()).orElse("") + " " + Optional.ofNullable(o.getModel().getModel()).orElse("")));
        return result;
    }
    //End code here
}
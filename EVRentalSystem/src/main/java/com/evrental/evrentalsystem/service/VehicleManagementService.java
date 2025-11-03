package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.entity.VehicleModel;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.VehicleModelRepository;
import com.evrental.evrentalsystem.request.AdminUpdateVehicleDetailRequest;
import com.evrental.evrentalsystem.response.admin.AdminVehicleDetailResponse;
import com.evrental.evrentalsystem.response.admin.AdminVehicleModelResponse;
import com.evrental.evrentalsystem.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleManagementService {

    private final VehicleModelRepository vehicleModelRepository;
    private final VehicleDetailRepository vehicleDetailRepository;
    private final StationRepository stationRepository;
    public List<AdminVehicleModelResponse> getAllVehiclesGroupedByModel() {
        List<VehicleModel> models = vehicleModelRepository.findAllWithDetailsAndStation();

        // Vì JOIN FETCH trên collection có thể lặp parent, ta group theo vehicleId
        Map<Integer, AdminVehicleModelResponse> map = new LinkedHashMap<>();

        for (VehicleModel vm : models) {
            Integer vid = vm.getVehicleId();
            AdminVehicleModelResponse vmResp = map.computeIfAbsent(vid, id -> AdminVehicleModelResponse.builder()
                    .vehicleId(vm.getVehicleId())
                    .brand(vm.getBrand())
                    .model(vm.getModel())
                    .price(vm.getPrice())
                    .seats(vm.getSeats())
                    .modelPicture(vm.getPicture())
                    .vehicleDetails(new ArrayList<>())
                    .build()
            );

            List<VehicleDetail> details = vm.getVehicleDetails();
            if (details == null) continue;

            for (VehicleDetail vd : details) {
                // map detail -> DTO
                AdminVehicleDetailResponse dResp = AdminVehicleDetailResponse.builder()
                        .id(vd.getId())
                        .licensePlate(vd.getLicensePlate())
                        .batteryCapacity(vd.getBatteryCapacity())
                        .odo(vd.getOdo())
                        .detailPicture(vd.getPicture())
                        .status(vd.getStatus())
                        .color(vd.getColor())
                        .build();

                Station st = vd.getStation();
                if (st != null) {
                    dResp.setStationId(st.getStationId());
                    dResp.setStationName(st.getStationName());
                }

                vmResp.getVehicleDetails().add(dResp);
            }
        }

        return new ArrayList<>(map.values());
    }

    public String updateVehicleDetailStatus(Integer vehicleDetailId, String newStatus) {
        VehicleDetail vehicleDetail = vehicleDetailRepository.findById(vehicleDetailId)
                .orElseThrow(() -> new RuntimeException("Vehicle detail not found with id: " + vehicleDetailId));

        vehicleDetail.setStatus(newStatus);
        vehicleDetailRepository.save(vehicleDetail);

        return "Vehicle detail status updated successfully.";
    }


    public String updateVehicleDetail(Integer vehicleDetailId, AdminUpdateVehicleDetailRequest req) {
        VehicleDetail vd = vehicleDetailRepository.findById(vehicleDetailId)
                .orElseThrow(() -> new RuntimeException("VehicleDetail not found with id: " + vehicleDetailId));

        // Cập nhật các trường cơ bản nếu không null
        if (req.getLicensePlate() != null) vd.setLicensePlate(req.getLicensePlate());
        if (req.getBatteryCapacity() != null) vd.setBatteryCapacity(req.getBatteryCapacity());
        if (req.getOdo() != null) vd.setOdo(req.getOdo());
        if (req.getStatus() != null) vd.setStatus(req.getStatus());
        if (req.getColor() != null) vd.setColor(req.getColor());

        // Xử lý ảnh base64 nếu có
        if (req.getPicture() != null) {
            String parsedBase64 = ImageUtil.parseBase64(req.getPicture());
            vd.setPicture(parsedBase64);
        }

        // Cập nhật VehicleModel nếu có
        if (req.getVehicleId() != null) {
            VehicleModel vm = vehicleModelRepository.findById(req.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("VehicleModel not found with id: " + req.getVehicleId()));
            vd.setVehicleModel(vm);
        }

        // Cập nhật Station nếu có
        if (req.getStationId() != null) {
            Station st = stationRepository.findById(req.getStationId())
                    .orElseThrow(() -> new RuntimeException("Station not found with id: " + req.getStationId()));
            vd.setStation(st);
        }

        vehicleDetailRepository.save(vd);

        return "Vehicle detail updated successfully.";
    }

}
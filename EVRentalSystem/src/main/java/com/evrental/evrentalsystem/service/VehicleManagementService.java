package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.entity.VehicleModel;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.VehicleModelRepository;
import com.evrental.evrentalsystem.request.AdminCreateVehicleDetailRequest;
import com.evrental.evrentalsystem.request.AdminUpdateVehicleDetailRequest;
import com.evrental.evrentalsystem.response.admin.AdminGetAllVehicleDetailResponse;
import com.evrental.evrentalsystem.response.admin.AdminVehicleDetailResponse;
import com.evrental.evrentalsystem.response.admin.AdminVehicleModelResponse;
import com.evrental.evrentalsystem.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class VehicleManagementService {

    private final VehicleModelRepository vehicleModelRepository;
    private final VehicleDetailRepository vehicleDetailRepository;
    private final StationRepository stationRepository;
    ImageUtil imageUtil = new ImageUtil();
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

    public String createVehicleDetail(AdminCreateVehicleDetailRequest req, MultipartFile detailPicture) {
        VehicleModel vm = vehicleModelRepository.findById(req.getVehicleModelId())
                .orElseThrow(() -> new RuntimeException("Vehicle model not found with id: " + req.getVehicleModelId()));
        Station station = stationRepository.findById(req.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + req.getStationId()));

        VehicleDetail vd = new VehicleDetail();
        vd.setLicensePlate(req.getLicensePlate());
        vd.setBatteryCapacity(req.getBatteryCapacity());
        vd.setOdo(req.getOdo());
        vd.setColor(req.getColor());
        vd.setStatus("AVAILABLE");
        vd.setPicture(imageUtil.encodeToBase64(detailPicture));
        vd.setStation(station);
        vd.setVehicleModel(vm);
        vehicleDetailRepository.save(vd);
        return "Vehicle detail created successfully.";
    }

    public String updateVehicleDetail(AdminUpdateVehicleDetailRequest req, MultipartFile detailPicture) {
        VehicleDetail vd = vehicleDetailRepository.findById(req.getDetailId())
                .orElseThrow(() -> new RuntimeException("Vehicle detail not found with id: " + req.getDetailId()));
        VehicleModel vm = vehicleModelRepository.findById(req.getVehicleModelId())
                .orElseThrow(() -> new RuntimeException("Vehicle model not found with id: " + req.getVehicleModelId()));
        Station station = stationRepository.findById(req.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + req.getStationId()));

        vd.setLicensePlate(req.getLicensePlate());
        vd.setBatteryCapacity(req.getBatteryCapacity());
        vd.setOdo(req.getOdo());
        vd.setColor(req.getColor());
        vd.setStatus("AVAILABLE");
        vd.setPicture(imageUtil.encodeToBase64(detailPicture));
        vd.setStation(station);
        vd.setVehicleModel(vm);
        vehicleDetailRepository.save(vd);
        return "Vehicle update created successfully.";
    }
    public AdminGetAllVehicleDetailResponse getVehicleDetailById(Integer vehicleDetailId) {
        VehicleDetail vd = vehicleDetailRepository.findById(vehicleDetailId)
                .orElseThrow(() -> new RuntimeException("VehicleDetail not found with id: " + vehicleDetailId));

        AdminGetAllVehicleDetailResponse resp = AdminGetAllVehicleDetailResponse.builder()
                .detailId(vd.getId())
                .licensePlate(vd.getLicensePlate())
                .batteryCapacity(vd.getBatteryCapacity())
                .odo(vd.getOdo())
                // Trả URL ảnh (backend tự phục vụ ở endpoint image/{id})
                .detailPicture("http://localhost:8084/EVRentalSystem/vehicle-management/image/" + vd.getId())
                .status(vd.getStatus())
                .color(vd.getColor())
                .build();

        VehicleModel vm = vd.getVehicleModel();
        if (vm != null) {
            resp.setModelId(vm.getVehicleId());
            resp.setBrand(vm.getBrand());
            resp.setModel(vm.getModel());
        }

        if (vd.getStation() != null) {
            resp.setStationId(vd.getStation().getStationId());
            resp.setStationName(vd.getStation().getStationName());
        }

        return resp;
    }

    public VehicleDetail findVehicleDetailEntity(Integer vehicleDetailId) {
        return vehicleDetailRepository.findById(vehicleDetailId)
                .orElseThrow(() -> new RuntimeException("VehicleDetail not found with id: " + vehicleDetailId));
    }
}
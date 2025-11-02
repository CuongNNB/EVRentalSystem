package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.VehicleModelRepository;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.projection.VehicleListProjection;
import com.evrental.evrentalsystem.response.admin.VehicleDetailResponse;
import com.evrental.evrentalsystem.request.UpdateVehicleRequest;
import com.evrental.evrentalsystem.entity.VehicleDetail;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

@Primary
@Service
@RequiredArgsConstructor
public class VehicleAdminServiceImpl implements VehicleAdminService {

    private final VehicleDetailRepository repo;
    // Cần cho update quan hệ (không dùng trong list)
    private final StationRepository stationRepo;
    private final VehicleModelRepository vehicleModelRepo;

    // =========================
    // LIST
    // =========================
    @Override
    public Page<VehicleListProjection> getVehicleList(
            String q,
            String status,
            Integer stationId,
            String brand,
            String model,
            Pageable pageable
    ) {
        System.out.println(">>> [VehicleAdminServiceImpl] searchVehicleList() CALLED <<<");
        System.out.printf(
                ">>> Params -> q=%s | status=%s | stationId=%s | brand=%s | model=%s | page=%d | size=%d%n",
                q, status, stationId, brand, model, pageable.getPageNumber(), pageable.getPageSize()
        );

        // Gợi ý: để ẩn DELETED, thêm điều kiện vào query repo:
        //   ... AND UPPER(v.status) <> 'DELETED'
        return repo.searchVehicleList(
                normalize(q),
                normalize(status),
                stationId,
                normalize(brand),
                normalize(model),
                pageable
        );
    }

    // =========================
    // DETAIL
    // =========================
    @Override
    public VehicleDetailResponse getVehicleById(Integer id) {
        var v = repo.findDetailWithModelAndStation(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));

        return VehicleDetailResponse.builder()
                .id(v.getId())
                .licensePlate(v.getLicensePlate())
                .status(v.getStatus())
                .odo(v.getOdo())
                .color(v.getColor())
                .picture(v.getPicture())
                .stationId(v.getStation() != null ? v.getStation().getStationId() : null)
                .stationName(v.getStation() != null ? v.getStation().getStationName() : null)
                .vehicleId(v.getVehicleModel() != null ? v.getVehicleModel().getVehicleId() : null)
                .brand(v.getVehicleModel() != null ? v.getVehicleModel().getBrand() : null)
                .model(v.getVehicleModel() != null ? v.getVehicleModel().getModel() : null)
                .build();
    }

    // =========================
    // UPDATE
    // =========================
    @Transactional
    @Override
    public void updateVehicle(Integer id, UpdateVehicleRequest r) {
        VehicleDetail v = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));

        // Không cho sửa xe đã xoá mềm (tránh revive nhầm)
        if ("DELETED".equalsIgnoreCase(v.getStatus())) {
            throw new RuntimeException("Vehicle is deleted (soft). Restore or create new record instead.");
        }

        if (r.getLicensePlate() != null) v.setLicensePlate(r.getLicensePlate().trim());
        if (r.getStatus() != null)       v.setStatus(r.getStatus().trim());
        if (r.getOdo() != null)          v.setOdo(r.getOdo());
        if (r.getColor() != null)        v.setColor(r.getColor().trim());
        if (r.getPicture() != null)      v.setPicture(r.getPicture().trim());

        if (r.getStationId() != null) {
            var s = stationRepo.findById(r.getStationId())
                    .orElseThrow(() -> new RuntimeException("Station not found: " + r.getStationId()));
            v.setStation(s);
        }

        if (r.getVehicleModelId() != null) {
            var vm = vehicleModelRepo.findById(r.getVehicleModelId())
                    .orElseThrow(() -> new RuntimeException("VehicleModel not found: " + r.getVehicleModelId()));
            v.setVehicleModel(vm);
        }

        repo.save(v);
    }

    // =========================
    // SOFT DELETE
    // =========================
    @Transactional
    @Override
    public void deleteVehicle(Integer id) {
        VehicleDetail v = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));

        // Không cho xoá khi đang RENTED
        if ("RENTED".equalsIgnoreCase(v.getStatus())) {
            throw new RuntimeException("Cannot delete vehicle while RENTED.");
        }

        // Đánh dấu xoá mềm → KHÔNG DELETE vật lý (tránh lỗi FK)
        v.setStatus("DELETED");

        // Ghi dấu biển số để tránh unique-key (nếu có)
        if (v.getLicensePlate() != null) {
            String plate = v.getLicensePlate();
            if (!plate.endsWith("#" + v.getId())) {
                v.setLicensePlate(plate + "#" + v.getId());
            }
        }

        // Có thể thêm các cờ/dấu khác nếu bạn muốn (ví dụ archivedAt…)

        repo.save(v);
    }

    // =========================
    // Utils
    // =========================
    private String normalize(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}

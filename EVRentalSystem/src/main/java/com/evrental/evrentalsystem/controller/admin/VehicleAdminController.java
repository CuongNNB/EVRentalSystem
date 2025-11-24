package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.enums.VehicleStatus;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.request.CreateVehicleRequest;
import com.evrental.evrentalsystem.request.UpdateVehicleRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import com.evrental.evrentalsystem.service.VehicleAdminService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
@RestController
@RequestMapping("/api/vehicle") //

@RequiredArgsConstructor
public class VehicleAdminController {

    private final VehicleDetailRepository vehicleDetailRepository;

    private final VehicleAdminService service;


    @PostMapping
    public ResponseEntity<?> handleVehicleActions(@RequestBody Map<String, Object> payload) {
        String action = (String) payload.get("action");

        if (!"getStatsByStation".equalsIgnoreCase(action)) {
            return ResponseEntity.badRequest().body("Invalid or missing action.");
        }

        Integer stationId = (Integer) payload.get("stationId");
        Map<VehicleStatus, Long> stats = new LinkedHashMap<>();

        if (stationId == null || stationId == 0) {
            stats.put(VehicleStatus.AVAILABLE, vehicleDetailRepository.countByStatus(VehicleStatus.AVAILABLE));
            stats.put(VehicleStatus.RENTED, vehicleDetailRepository.countByStatus(VehicleStatus.RENTED));
            stats.put(VehicleStatus.RENTED, vehicleDetailRepository.countByStatus(VehicleStatus.RENTED));
        } else {
            stats.put(VehicleStatus.AVAILABLE, vehicleDetailRepository.countByStatus(VehicleStatus.AVAILABLE));
            stats.put(VehicleStatus.RENTED, vehicleDetailRepository.countByStatus(VehicleStatus.RENTED));
            stats.put(VehicleStatus.RENTED, vehicleDetailRepository.countByStatus(VehicleStatus.RENTED));
        }

        return ResponseEntity.ok(stats);
    }
    @GetMapping("/vehicles")

    public ResponseEntity<?> listVehicles(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer stationId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        var result = service.getVehicleList(q, status, stationId, brand, model, pageable);
        return ResponseEntity.ok(result);
    }
    @PutMapping("/vehicles/{id}")
    public ResponseEntity<Map<String, Object>> updateVehicle(
            @PathVariable Integer id, @RequestBody UpdateVehicleRequest body) {
        service.updateVehicle(id, body);
        return ResponseEntity.ok(Map.of("success", true, "id", id));
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Map<String, Object>> deleteVehicle(@PathVariable Integer id) {
        service.deleteVehicle(id);
        return ResponseEntity.ok(Map.of("success", true, "id", id));
    }
    // NEW: Tạo xe mới
    @PostMapping("/vehicles")
    public ResponseEntity<Map<String, Object>> createVehicle(@RequestBody CreateVehicleRequest body) {
        Integer id = service.createVehicle(body);
        return ResponseEntity.ok(Map.of("success", true, "id", id));
    }
    @GetMapping("/ping")
    public String ping() { return "OK"; }

}

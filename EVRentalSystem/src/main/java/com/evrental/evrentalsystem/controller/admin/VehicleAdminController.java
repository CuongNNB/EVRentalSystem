package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("api/vehicle")
@RequiredArgsConstructor
public class VehicleAdminController {

    private final VehicleDetailRepository vehicleDetailRepository;

    @PostMapping
    public ResponseEntity<?> handleVehicleActions(@RequestBody Map<String, Object> payload) {
        String action = (String) payload.get("action");

        if (!"getStatsByStation".equalsIgnoreCase(action)) {
            return ResponseEntity.badRequest().body("Invalid or missing action.");
        }

        Integer stationId = (Integer) payload.get("stationId");
        Map<String, Long> stats = new LinkedHashMap<>();

        if (stationId == null || stationId == 0) {
            // Toàn hệ thống
            stats.put("total", vehicleDetailRepository.count());
            stats.put("available", vehicleDetailRepository.countByStatus("AVAILABLE"));
            stats.put("rented", vehicleDetailRepository.countByStatus("RENTED"));
            stats.put("fixing", vehicleDetailRepository.countByStatus("FIXING"));
        } else {
            // Theo từng trạm
            stats.put("total", vehicleDetailRepository.countVehiclesByStationId(stationId));
            stats.put("available", vehicleDetailRepository.countByStationIdAndStatus(stationId, "AVAILABLE"));
            stats.put("rented", vehicleDetailRepository.countByStationIdAndStatus(stationId, "RENTED"));
            stats.put("fixing", vehicleDetailRepository.countByStationIdAndStatus(stationId, "FIXING"));
        }

        return ResponseEntity.ok(stats);
    }
}

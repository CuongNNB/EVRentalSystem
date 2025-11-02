package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
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
        Map<String, Long> stats = new LinkedHashMap<>();

        if (stationId == null || stationId == 0) {
            stats.put("total", vehicleDetailRepository.count());
            stats.put("available", vehicleDetailRepository.countByStatus("AVAILABLE"));
            stats.put("rented", vehicleDetailRepository.countByStatus("RENTED"));
            stats.put("fixing", vehicleDetailRepository.countByStatus("FIXING"));
        } else {
            stats.put("total", vehicleDetailRepository.countVehiclesByStationId(stationId));
            stats.put("available", vehicleDetailRepository.countByStationIdAndStatus(stationId, "AVAILABLE"));
            stats.put("rented", vehicleDetailRepository.countByStationIdAndStatus(stationId, "RENTED"));
            stats.put("fixing", vehicleDetailRepository.countByStationIdAndStatus(stationId, "FIXING"));
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

    @GetMapping("/ping")
    public String ping() { return "OK"; }

}

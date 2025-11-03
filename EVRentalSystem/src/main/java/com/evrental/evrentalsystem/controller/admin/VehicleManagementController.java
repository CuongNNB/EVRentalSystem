package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.request.AdminUpdateVehicleDetailRequest;
import com.evrental.evrentalsystem.request.AdminUpdateVehicleStatusRequest;
import com.evrental.evrentalsystem.response.admin.AdminVehicleModelResponse;
import com.evrental.evrentalsystem.service.VehicleManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vehicle-management")
@RequiredArgsConstructor
public class VehicleManagementController {

    private final VehicleManagementService vehicleManagementService;

    //API: http://localhost:8084/EVRentalSystem/vehicle-management/vehicles
    @GetMapping("/vehicles")
    public ResponseEntity<List<AdminVehicleModelResponse>> getAllVehicles() {
        List<AdminVehicleModelResponse> results = vehicleManagementService.getAllVehiclesGroupedByModel();
        return ResponseEntity.ok(results);
    }

    //API: http://localhost:8084/EVRentalSystem/vehicle-management/{vehicleDetailId}/status
    @PutMapping("/{vehicleDetailId}/status")
    public ResponseEntity<Map<String, String>> updateVehicleDetailStatus(
            @PathVariable Integer vehicleDetailId,
            @RequestBody AdminUpdateVehicleStatusRequest request) {

        String message = vehicleManagementService.updateVehicleDetailStatus(vehicleDetailId, request.getStatus());

        Map<String, String> response = new HashMap<>();
        response.put("message", message);

        return ResponseEntity.ok(response);
    }


    //API: http://localhost:8084/EVRentalSystem/vehicle-management/{vehicleDetailId}
    @PutMapping("/{vehicleDetailId}")
    public ResponseEntity<Map<String, String>> updateVehicleDetail(
            @PathVariable Integer vehicleDetailId,
            @RequestBody AdminUpdateVehicleDetailRequest request) {

        String message = vehicleManagementService.updateVehicleDetail(vehicleDetailId, request);
        Map<String, String> response = new HashMap<>();
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

}
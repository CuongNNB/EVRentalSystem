package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.request.AdminCreateVehicleDetailRequest;
import com.evrental.evrentalsystem.request.AdminUpdateVehicleDetailRequest;
import com.evrental.evrentalsystem.request.AdminUpdateVehicleStatusRequest;
import com.evrental.evrentalsystem.response.admin.AdminVehicleModelResponse;
import com.evrental.evrentalsystem.service.VehicleManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    //API: http://localhost:8084/EVRentalSystem/api/vehicle-management/{vehicleDetailId}/status
    @PutMapping("/{vehicleDetailId}/status")
    public ResponseEntity<Map<String, String>> updateVehicleDetailStatus(
            @PathVariable Integer vehicleDetailId,
            @RequestBody AdminUpdateVehicleStatusRequest request) {

        String message = vehicleManagementService.updateVehicleDetailStatus(vehicleDetailId, request.getStatus());

        Map<String, String> response = new HashMap<>();
        response.put("message", message);

        return ResponseEntity.ok(response);
    }
    //Update xe
    @PutMapping(name = "/update-vehicle/{detailId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> updateVehicleDetail(
            @PathVariable Integer detailId,
            @RequestParam("licensePlate") String licensePlate,
            @RequestParam("batteryCapacity") String batteryCapacity,
            @RequestParam("odo") String odo,
            @RequestParam("color") String color,
            @RequestParam("stationId") Integer stationId,
            @RequestParam("vehicleModelId") Integer vehicleModelId,
            @RequestParam("picture")MultipartFile picture) {

        AdminUpdateVehicleDetailRequest req = new AdminUpdateVehicleDetailRequest();
        req.setDetailId(detailId);
        req.setLicensePlate(licensePlate);
        req.setBatteryCapacity(batteryCapacity);
        req.setOdo(Integer.parseInt(odo));
        req.setColor(color);
        req.setStationId(stationId);
        req.setVehicleModelId(vehicleModelId);

        String message = vehicleManagementService.updateVehicleDetail(req, picture);

        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }
    //Thêm xe
    //API: http://localhost:8084/EVRentalSystem/api/vehicle-management/create-vehicle
    @PostMapping(value = "/create-vehicle", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> createVehicleDetail(
            @RequestParam("licensePlate") String licensePlate,
            @RequestParam("batteryCapacity") String batteryCapacity,
            @RequestParam("odo") String odo,
            @RequestParam("color") String color,
            @RequestParam("stationId") Integer stationId,
            @RequestParam("vehicleModelId") Integer vehicleModelId,
            @RequestParam("picture")MultipartFile picture)
    {
        AdminCreateVehicleDetailRequest req = new AdminCreateVehicleDetailRequest();
        req.setLicensePlate(licensePlate);
        req.setBatteryCapacity(batteryCapacity);
        req.setOdo(Integer.parseInt(odo));
        req.setColor(color);
        req.setStationId(stationId);
        req.setVehicleModelId(vehicleModelId);

        String message = vehicleManagementService.createVehicleDetail(req, picture);

        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

}
package com.evrental.evrentalsystem.controller.staff;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.response.ApiResponse;
import com.evrental.evrentalsystem.response.staff.VehicleDetailsResponse;
import com.evrental.evrentalsystem.response.staff.VehicleIdAndLicensePlateResponse;
import com.evrental.evrentalsystem.service.StaffService;
import com.evrental.evrentalsystem.response.staff.BookingsInStationResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/vehicle-details")
public class VehicleDetailController {
    @Autowired
    private StaffService staffService;


    // API lấy các biển số xe đang có sẵn theo model và trạm
    // GET http://localhost:8084/EVRentalSystem/api/vehicle-details/available?modelId=1&stationId=1
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VehicleIdAndLicensePlateResponse>>>
    getAvailableVehiclesByModelAndStation(
            @RequestParam Integer modelId,
            @RequestParam Integer stationId) {

        try {
            List<VehicleIdAndLicensePlateResponse> vehicles =
                    staffService.getAllAvailableVehiclesInStationAndModel(modelId, stationId);

            if (vehicles == null || vehicles.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No available vehicles found for model ID "
                                + modelId + " and station ID " + stationId, null));
            }

            return ResponseEntity.ok(ApiResponse.success("Available vehicles fetched successfully", vehicles));

        } catch (Exception e) {
            log.error("❌ Error fetching available vehicles for model ID {} and station ID {}: {}",
                    modelId, stationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching available vehicles", null));
        }
    }

    // API lấy chi tiết xe theo Id
    // GET http://localhost:8084/EVRentalSystem/api/vehicle-details/1
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDetailsResponse>> getVehicleDetailsById(@PathVariable int id) {
        try {
            VehicleDetailsResponse vehicleDetails = staffService.getVehicleDetailById(id);

            if (vehicleDetails == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No vehicle detail found for ID: " + id, null));
            }

            return ResponseEntity.ok(ApiResponse.success("Vehicle detail fetched successfully", vehicleDetails));

        } catch (Exception e) {
            log.error("❌ Error fetching vehicle detail for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching vehicle detail", null));
        }
    }

    // API cập nhật status của xe
    // PUT http://localhost:8084/EVRentalSystem/api/vehicle-details/update-status?vehicleId=1&newStatus=RENTED
    @PutMapping("/update-status")
    public ResponseEntity<ApiResponse<String>> updateVehicleStatus(
            @RequestParam Integer vehicleId,
            @RequestParam String newStatus) {

        try {
            boolean updated = staffService.changeVehicleStatus(vehicleId, newStatus);

            if (!updated) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Vehicle not found or status not updated", null));
            }

            return ResponseEntity.ok(ApiResponse.success("Vehicle status updated successfully", null));

        } catch (Exception e) {
            log.error("❌ Error updating status for vehicle ID {}: {}", vehicleId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating vehicle status", null));
        }
    }



}

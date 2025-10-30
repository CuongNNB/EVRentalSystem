package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.response.staff.ModelWithDetailsDTO;
import com.evrental.evrentalsystem.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-management")
@RequiredArgsConstructor
public class VehicleManageController {
    private final VehicleService vehicleService;

    //API: http://localhost:8084/EVRentalSystem/api/vehicle-management/{stationId}/models
    @GetMapping("/{stationId}/models")
    public ResponseEntity<List<ModelWithDetailsDTO>> getModelsByStation(@PathVariable Integer stationId) {
        List<ModelWithDetailsDTO> result = vehicleService.getModelsWithDetailsByStation(stationId);
        return ResponseEntity.ok(result);
    }
}

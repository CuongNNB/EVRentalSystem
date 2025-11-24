package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.entity.VehicleModel;
import com.evrental.evrentalsystem.response.vehicle.VehicleDetailResponse;
import com.evrental.evrentalsystem.response.vehicle.VehicleWithIdResponse;
import com.evrental.evrentalsystem.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService;

    //API này dùng để lấy các danh sách xe có sẵn khi nhấn ở interface.
    //Front-end dùng API này thì gọi đến: http://localhost:8084/EVRentalSystem/api/vehicles/available
    @GetMapping("/available")
    public List<VehicleDetailResponse> getAvailableVehicles() {
        return vehicleService.getAvailableVehicles();
    }

    @GetMapping("/{vehicleModelId}/details")
    public ResponseEntity<List<VehicleWithIdResponse>> getDetailsByVehicleModelId(
            @PathVariable Integer vehicleModelId) {

        List<VehicleWithIdResponse> response =
                vehicleService.getDetailsByVehicleModelId(vehicleModelId);

        return ResponseEntity.ok(response);
    }

    //API: http://localhost:8084/EVRentalSystem/api/vehicles/brands
    @GetMapping("/brands")
    public ResponseEntity<List<Map<String, String>>> getBrandModelNames() {
        List<VehicleModel> models = vehicleService.findAllVehicleModels();

        List<Map<String, String>> response = models.stream()
                .map(m -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", String.valueOf(m.getVehicleId()));
                    map.put("brand", m.getBrand()); // Ví dụ: "VinFast VF8"
                    return map;
                })
                .toList();

        return ResponseEntity.ok(response);
    }
    //End code here
}
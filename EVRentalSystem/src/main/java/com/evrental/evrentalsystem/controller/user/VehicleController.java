package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.response.vehicle.VehicleDetailResponse;
import com.evrental.evrentalsystem.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService;

    //API này dùng để lấy các danh sách xe có sẵn khi nhấn ở interface.
    //Front-end dùng API này thì gọi đến: localhost:8084/EVRentalSystem/api/vehicles/available
    @GetMapping("/available")
    public List<VehicleDetailResponse> getAvailableVehicles() {
        return vehicleService.getAvailableVehicles();
    }

    //End code here
}
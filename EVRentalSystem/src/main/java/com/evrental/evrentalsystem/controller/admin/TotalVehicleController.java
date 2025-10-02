package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.request.TotalVehicleRequest;
import com.evrental.evrentalsystem.response.admin.TotalVehicleResponse;
import com.evrental.evrentalsystem.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stations")
@RequiredArgsConstructor
public class TotalVehicleController {
    private final AdminService adminService;

    //Đây là API dành cho admin để lấy tổng số xe tại một trạm cụ thể
    //Gọi API này dùng: http://localhost:8084/EVRentalSystem/api/admin/stations/total-vehicles
    //Body raw JSON:
    //{
    //    "stationId": 1
    //}
    //Author: Nguyễn Ngọc Bảo Cường / Ngày: 2/10/2025
    @PostMapping("/total-vehicles")
    public ResponseEntity<TotalVehicleResponse> getTotalVehicles(@RequestBody TotalVehicleRequest request) {
        return ResponseEntity.ok(adminService.getTotalVehicles(request));
    }
}

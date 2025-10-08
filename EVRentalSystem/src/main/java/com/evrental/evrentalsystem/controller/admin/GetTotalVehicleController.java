package com.evrental.evrentalsystem.controller.admin;
import com.evrental.evrentalsystem.response.admin.RentedVehicleResponse;
import com.evrental.evrentalsystem.response.admin.TotalVehicleResponse;
import com.evrental.evrentalsystem.response.vehicle.FixingVehicleResponse;
import com.evrental.evrentalsystem.service.AdminService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/admin")
@CrossOrigin(origins = "*")
@Data
@AllArgsConstructor
public class GetTotalVehicleController {
    private final AdminService adminService;

    //API này để lấy tổng số xe tại một trạm cụ thể cho admin.
    //Front-end gọi API này: https://localhost:8084/EVRentalSystem/api/admin/station/{stationId}/vehicles/total
    //Ví dụ: http://localhost:8084/EVRentalSystem/api/admin/station/1/vehicles/total
    @GetMapping("/station/{stationId}/vehicles/total")
    public TotalVehicleResponse getTotalVehiclesByStation(@PathVariable Integer stationId) {
        return adminService.getTotalVehiclesByStation(stationId);
    }

    // API này dùng để lấy tổng số xe có trạng thái RENTED (đang thuê) ở 1 trạm cụ thể cho ADMIN.
    // Front-end gọi API này: https://localhost:8084/EVRentalSystem/api/admin/station/{stationId}/vehicles/rented
    // Ví dụ: http://localhost:8084/EVRentalSystem/api/admin/station/1/vehicles/rented
    @GetMapping("/station/{stationId}/vehicles/rented")
    public RentedVehicleResponse getRentedVehiclesByStation(@PathVariable Integer stationId) {
        return adminService.getRentedVehiclesByStation(stationId);
    }

    //API này dùng để lấy các list xe đang được sửa ở 1 trạm cụ tể
    //API: http://localhost:8084/EVRentalSystem/api/admin/fixing/{stationId}
    @GetMapping("/fixing/{stationId}")
    public ResponseEntity<FixingVehicleResponse> getFixingVehicles(@PathVariable Integer stationId) {
        FixingVehicleResponse response = adminService.getFixingVehiclesByStation(stationId);
        return ResponseEntity.ok(response);
    }
}

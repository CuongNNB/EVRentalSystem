package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.response.vehicle.VehicleAtStationResponse;
import com.evrental.evrentalsystem.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;


    //API này cho phép người dùng tìm kiếm các trạm theo quận/huyện
    //Gọi API này dùng: http://localhost:8084/EVRentalSystem/api/stations/{stationId}/vehicles/availabl
    //Ví dụ: http://localhost:8084/EVRentalSystem/api/stations/3/vehicles/available
    @GetMapping("/{stationId}/vehicles/available")
    public ResponseEntity<List<VehicleAtStationResponse>> getAvailableVehicles(@PathVariable Integer stationId) {
        try {
            List<VehicleAtStationResponse> list = stationService.findStationsByDistrict(stationId);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}

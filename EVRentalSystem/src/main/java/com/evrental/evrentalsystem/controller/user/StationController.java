package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.response.vehicle.VehicleAtStationResponse;
import com.evrental.evrentalsystem.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    //API này cho phép người dùng tìm kiếm các trạm theo quận/huyện
    //Gọi API này dùng: http://localhost:8084/EVRentalSystem/api/stations/search?district={Quận được lấy từ nút trạm}
    //Ví dụ: http://localhost:8084/EVRentalSystem/api/stations/search?district=Thủ Đức
    @GetMapping("/search")
    public List<VehicleAtStationResponse> searchStationsByDistrict(
            @RequestParam("district") String district) {
        return stationService.findStationsByDistrict(district);
    }
}

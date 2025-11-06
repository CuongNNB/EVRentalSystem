package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.enums.PartCarName;
import com.evrental.evrentalsystem.response.ApiResponse;
import com.evrental.evrentalsystem.response.staff.InspectionDetailsByBookingResponse;
import com.evrental.evrentalsystem.response.staff.VehicleDetailsByBookingResponse;
import com.evrental.evrentalsystem.response.user.GetAllAdminResponse;
import com.evrental.evrentalsystem.service.StaffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/report")
public class ReportController {

    @Autowired
    private StaffService staffService;

    // API tạo mới report cho admin cùng trạm
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Boolean>> createReport(
            @RequestParam Integer staffId,
            @RequestParam Integer vehicleDetailId,
            @RequestParam String description,
            @RequestParam Integer adminId

    ) {
        staffService.createReport(staffId, vehicleDetailId,description, adminId);
        return ResponseEntity.ok(ApiResponse.success("Report created successfully", true));
    }

    @GetMapping("/all-admins")
    public ResponseEntity<List<GetAllAdminResponse>> getAllAdmins() {
        List<GetAllAdminResponse> response = staffService.getAllAdmins();
        return ResponseEntity.ok(response);
    }

    //API: http://localhost:8084/EVRentalSystem/api/report/{staffId}/get-station
    @GetMapping("/{staffId}/get-station")
    public ResponseEntity<String> getStaffStationId(@PathVariable Integer staffId) {
        String stationId = staffService.GetStationId(staffId);
        return ResponseEntity.ok("Station ID: " + stationId);
    }
}

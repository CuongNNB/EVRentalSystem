package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.enums.RenterDetailVerificationStatusEnum;
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
@RequestMapping("/api/renter-detail")
public class RenterDetailController {

    @Autowired
    private StaffService staffService;

    //API này dùng để chuyển verification_status trong bảng Renter Detail thành verify
    @PostMapping("/verify-renter")
    public ResponseEntity<ApiResponse<Boolean>> createInspection(
            @RequestParam Integer bookingId
    ) {
        staffService.verifyRenterDetailStatusByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Verify successfully", true));
    }

    //API này lấy ra verification_status trong bảng Renter Detail
    @GetMapping("/verification-status")
    public ResponseEntity<ApiResponse<RenterDetailVerificationStatusEnum>> getVerifycationStatus(
            @RequestParam Integer bookingId
    ){
        RenterDetailVerificationStatusEnum s = staffService.getVerificationStatusByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Get verification status successfully", s));
    }


}

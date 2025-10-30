package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.enums.PartCarName;
import com.evrental.evrentalsystem.response.ApiResponse;
import com.evrental.evrentalsystem.response.staff.InspectionDetailsByBookingResponse;
import com.evrental.evrentalsystem.response.staff.VehicleDetailsByBookingResponse;
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
@RequestMapping("/api/inspections-after")
public class InspectionAfterController {

    @Autowired
    private StaffService staffService;


    // API tạo mới inspection (truyền param trực tiếp)
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Boolean>> createInspectionAfter(
            @RequestParam Integer bookingId,
            @RequestParam PartCarName partName,
            @RequestParam MultipartFile picture,
            @RequestParam String description,
            @RequestParam Integer staffId,
            @RequestParam String status
    ) {
        // Nếu có lỗi (ID không tồn tại, enum sai, lỗi hệ thống...),
        // GlobalExceptionHandler sẽ tự động bắt và trả phản hồi JSON lỗi cho FE.
        staffService.createInspectionAfter(bookingId, partName, picture, description, staffId, status);
        // Nếu chạy đến đây tức là mọi thứ OK
        return ResponseEntity.ok(ApiResponse.success("Inspection created successfully", true));
    }

    //API này lấy tất cả các inspections theo bookingId
    @GetMapping("/booking-id/{id}")
    public ResponseEntity<ApiResponse<List<InspectionDetailsByBookingResponse>>> getInspectionAfterDetailsByBookingId(@PathVariable int id) {
        List<InspectionDetailsByBookingResponse> response = staffService.getInspectionAfterDetailsByBookingId(id);
        return ResponseEntity.ok(ApiResponse.success("Get inspection details successfully", response));
    }

}
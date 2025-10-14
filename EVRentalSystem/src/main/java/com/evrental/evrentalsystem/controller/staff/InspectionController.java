package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.enums.PartCarName;
import com.evrental.evrentalsystem.response.ApiResponse;
import com.evrental.evrentalsystem.service.StaffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    @Autowired
    private StaffService staffService;


    // API tạo mới inspection (truyền param trực tiếp)
    // POST http://localhost:8084/EVRentalSystem/api/inspections/create?bookingId=1&partName=Front_Side&picture=...&staffId=3&status=PENDING

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Boolean>> createInspection(
            @RequestParam Integer bookingId,
            @RequestParam PartCarName partName,
            @RequestParam MultipartFile picture,
            @RequestParam Integer staffId,
            @RequestParam String status
    ) {
        // Nếu có lỗi (ID không tồn tại, enum sai, lỗi hệ thống...),
        // GlobalExceptionHandler sẽ tự động bắt và trả phản hồi JSON lỗi cho FE.
        staffService.createInspection(bookingId, partName, picture, staffId, status);
        // Nếu chạy đến đây tức là mọi thứ OK
        return ResponseEntity.ok(ApiResponse.success("Inspection created successfully", true));
    }
}

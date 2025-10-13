package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.enums.AdditionalFeeEnum;
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
@RequestMapping("/api/additional-fee")
public class AdditionalFeeController {
    @Autowired
    private StaffService staffService;


    // API tạo mới additional fee
    // POST http://localhost:8084/EVRentalSystem/api/additional-fee/create

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Boolean>> createInspection(
            @RequestParam Integer bookingId,
            @RequestParam AdditionalFeeEnum feeName,
            @RequestParam int amount,
            @RequestParam String desc
    ) {
        // Nếu có lỗi (ID không tồn tại, enum sai, lỗi hệ thống...),
        // GlobalExceptionHandler sẽ tự động bắt và trả phản hồi JSON lỗi cho FE.
        staffService.createAdditionalFee(bookingId, feeName, amount, desc);

        // Nếu chạy đến đây tức là mọi thứ OK
        return ResponseEntity.ok(ApiResponse.success("Inspection created successfully", true));
    }
}

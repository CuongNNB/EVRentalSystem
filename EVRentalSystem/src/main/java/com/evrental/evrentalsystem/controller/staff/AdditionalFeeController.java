package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.enums.AdditionalFeeEnum;
import com.evrental.evrentalsystem.response.ApiResponse;
import com.evrental.evrentalsystem.service.StaffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam String feeName,
            @RequestParam int amount,
            @RequestParam String desc
    ) {
        // Nếu có lỗi (ID không tồn tại, enum sai, lỗi hệ thống...),
        // GlobalExceptionHandler sẽ tự động bắt và trả phản hồi JSON lỗi cho FE.
        boolean result = staffService.createAdditionalFee(bookingId, feeName, amount, desc);

        if (!result) {
            // Fee không được tạo vì không đạt điều kiện (vd: không vượt quãng đường, pin không giảm)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Không thể tạo phí phát sinh. Kiểm tra lại điều kiện (ví dụ: quãng đường chưa vượt cho phép, pin không giảm).", null));
        }

        // Nếu chạy đến đây tức là mọi thứ OK
        return ResponseEntity.ok(ApiResponse.success("Additional fee created successfully", true));
    }
}

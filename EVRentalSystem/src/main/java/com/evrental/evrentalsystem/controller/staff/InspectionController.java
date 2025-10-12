package com.evrental.evrentalsystem.controller.staff;

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
    private StaffService inspectionService;


    // API tạo mới inspection (truyền param trực tiếp)
    // POST http://localhost:8084/EVRentalSystem/api/inspections/create?bookingId=1&partName=Front_Side&picture=...&staffId=3&status=PENDING

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Boolean>> createInspection(
            @RequestParam Integer bookingId,
            @RequestParam String partName,
            @RequestParam MultipartFile picture,
            @RequestParam Integer staffId,
            @RequestParam String status
    ) {
        try {
            boolean created = inspectionService.createInspection(
                    bookingId,
                    partName,
                    picture,
                    staffId,
                    status
            );

            if (!created) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Failed to create inspection", false));
            }

            return ResponseEntity.ok(ApiResponse.success("Inspection created successfully", true));

        } catch (Exception e) {
            log.error("❌ Error creating inspection: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal error occurred while creating inspection", false));
        }
    }
}

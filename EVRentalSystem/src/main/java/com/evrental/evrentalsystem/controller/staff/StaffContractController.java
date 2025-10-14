package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.enums.PartCarName;
import com.evrental.evrentalsystem.response.ApiResponse;
import com.evrental.evrentalsystem.service.StaffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/contract")
public class StaffContractController {

    @Autowired
    private StaffService staffService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Boolean>> createInspection(
            @RequestParam Integer bookingId
    ) {
        staffService.createContractByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Contract created successfully", true));
    }
}

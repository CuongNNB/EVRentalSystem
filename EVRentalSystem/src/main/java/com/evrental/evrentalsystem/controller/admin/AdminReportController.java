package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.entity.Report;
import com.evrental.evrentalsystem.request.UpdateReportStatusRequest;
import com.evrental.evrentalsystem.response.admin.AdminGetAllReportResponse;
import com.evrental.evrentalsystem.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class AdminReportController {
    private final AdminService adminService;
    //API: http://localhost:8084/EVRentalSystem/api/reports/all-reports?userId=?
    @GetMapping("/all-reports")
    public ResponseEntity<List<AdminGetAllReportResponse>> getReportsByAdmin(@RequestParam("userId") Integer userId) {
        try {
            List<AdminGetAllReportResponse> dtos = adminService.getReportsByAdminId(userId);
            if (dtos.isEmpty()) return ResponseEntity.noContent().build();
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid request: {}", ex.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception ex) {
            log.error("Error getting reports for admin {}: {}", userId, ex.getMessage(), ex);
            return ResponseEntity.status(500).build();
        }
    }

    //API: http://localhost:8084/EVRentalSystem/api/reports/update-status
    @PutMapping("/update-status")
    public ResponseEntity<String> updateReportStatus(@RequestBody UpdateReportStatusRequest request) {
        try {
            String message = adminService.updateReportStatus(request);
            if (message.toLowerCase().contains("success")) {
                return ResponseEntity.ok(message);
            }
            return ResponseEntity.badRequest().body(message);
        } catch (Exception e) {
            log.error("Error updating report status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Update report status failed");
        }
    }
}

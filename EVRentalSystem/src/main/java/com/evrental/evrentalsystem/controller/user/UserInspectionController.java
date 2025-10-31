package com.evrental.evrentalsystem.controller.user;
import com.evrental.evrentalsystem.entity.Inspection;
import com.evrental.evrentalsystem.entity.InspectionAfter;
import com.evrental.evrentalsystem.enums.InspectionStatusEnum;
import com.evrental.evrentalsystem.repository.InspectionAfterRepository;
import com.evrental.evrentalsystem.repository.InspectionRepository;
import com.evrental.evrentalsystem.request.UserUpdateInspectionStatusRequest;
import com.evrental.evrentalsystem.service.InspectionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inspections")
public class UserInspectionController {
    private final InspectionService inspectionService;
    private final InspectionRepository inspectionRepository;
    private final InspectionAfterRepository inspectionAfterRepository;
    @Data
    public static class BookingIdRequest {
        private Integer bookingId;
    }

    //API: http://localhost:8084/EVRentalSystem/api/inspections/by-booking
    @PostMapping("/by-booking")
    public ResponseEntity<?> getInspectionsByBooking(@RequestBody BookingIdRequest request) {
        if (request == null || request.getBookingId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "bookingId is required"));
        }

        try {
            var list = inspectionService.getInspectionsByBookingId(request.getBookingId());
            if (list.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No inspection found for bookingId: " + request.getBookingId()));
            }
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    //API: http://localhost:8084/EVRentalSystem/api/inspections/inspection-after
    @PostMapping("/inspection-after")
    public ResponseEntity<?> getInspectionsAfterByBooking(@RequestBody BookingIdRequest request) {
        if (request == null || request.getBookingId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "bookingId is required"));
        }

        try {
            var list = inspectionService.getInspectionsAfter(request.getBookingId());
            if (list.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No inspection found for bookingId: " + request.getBookingId()));
            }
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", ex.getMessage()));
        }
    }


    /**
     * GET /api/inspections/{inspectionId}/picture
     * Trả ảnh từ base64 decode (dạng image/png hoặc jpeg)
     */
    @GetMapping("/{inspectionId}/picture")
    public ResponseEntity<?> getInspectionPicture(@PathVariable Integer inspectionId) {
        try {
            Optional<Inspection> opt = inspectionRepository.findById(inspectionId);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Inspection not found"));
            }

            Inspection inspection = opt.get();
            if (inspection.getPicture() == null || inspection.getPicture().isBlank()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body(Map.of("message", "No picture available"));
            }

            // Tách phần base64 (nếu có prefix data:image/...)
            String picBase64 = inspection.getPicture();
            int commaIdx = picBase64.indexOf(',');
            String base64Pure = commaIdx >= 0 ? picBase64.substring(commaIdx + 1) : picBase64;

            byte[] imageBytes = Base64.getDecoder().decode(base64Pure);

            // Xác định content type nếu có prefix data:image/png;base64,...
            String contentType = "image/png";
            if (picBase64.startsWith("data:image/jpeg")) {
                contentType = "image/jpeg";
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"inspection-" + inspectionId + ".png\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imageBytes);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/{inspectionAfterId}/picture-after")
    public ResponseEntity<?> getInspectionPictureAfter(@PathVariable Integer inspectionAfterId) {
        try {
            Optional<InspectionAfter> opt = inspectionAfterRepository.findById(inspectionAfterId);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Inspection not found"));
            }

            InspectionAfter inspection = opt.get();
            if (inspection.getPicture() == null || inspection.getPicture().isBlank()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body(Map.of("message", "No picture available"));
            }

            // Tách phần base64 (nếu có prefix data:image/...)
            String picBase64 = inspection.getPicture();
            int commaIdx = picBase64.indexOf(',');
            String base64Pure = commaIdx >= 0 ? picBase64.substring(commaIdx + 1) : picBase64;

            byte[] imageBytes = Base64.getDecoder().decode(base64Pure);

            // Xác định content type nếu có prefix data:image/png;base64,...
            String contentType = "image/png";
            if (picBase64.startsWith("data:image/jpeg")) {
                contentType = "image/jpeg";
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"inspection-" + inspectionAfterId + ".png\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imageBytes);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    //API: http://localhost:8084/EVRentalSystem/api/inspections/confirm/{bookingId}
    @PutMapping("/update-status")
    public ResponseEntity<UpdateStatusResponse> updateInspectionStatus(
            @RequestBody UserUpdateInspectionStatusRequest request) {
//
//        // Chuyển String -> Enum (nếu status là enum)
//        InspectionStatusEnum status;
//        try {
//            status = InspectionStatusEnum.valueOf(request.getStatus().toUpperCase());
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.badRequest()
//                    .body(new UpdateStatusResponse(request.getBookingId(), 0, "Invalid status value"));
//        }
//
//        List<Inspection> updated = inspectionService.updateInspectionStatus(request.getBookingId(), status.toString());
//
//        if (updated.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(new UpdateStatusResponse(request.getBookingId(), 0, "No inspections found for bookingId"));
//        }
//
//        return ResponseEntity.ok(
//                new UpdateStatusResponse(request.getBookingId(), updated.size(), "Status updated successfully")
//        );
        // Validate bookingId
        if (request.getBookingId() == null) {
            return ResponseEntity.badRequest()
                    .body(new UpdateStatusResponse(null, 0, 0, "Missing bookingId"));
        }

        // Chuyển String -> Enum (nếu status là enum)
        InspectionStatusEnum status;
        try {
            status = InspectionStatusEnum.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest()
                    .body(new UpdateStatusResponse(request.getBookingId(), 0, 0, "Invalid status value"));
        }

        try {
            // 1) Cập nhật inspections
            List<Inspection> updated = inspectionService.updateInspectionStatus(request.getBookingId(), status.toString());

            if (updated == null || updated.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new UpdateStatusResponse(request.getBookingId(), 0, 0, "No inspections found for bookingId"));
            }

            int deletedCount = 0;
            // 2) Nếu REJECTED -> xóa (hoặc soft-delete) các inspection bị REJECTED
            if (status == InspectionStatusEnum.REJECTED) {
                // Gọi service để xóa; nếu bạn chưa có, hãy thêm phương thức này vào service
                // Ví dụ service method: int deleteRejectedInspectionsByBookingId(Long bookingId)
                deletedCount = inspectionService.deleteRejectedInspectionsByBookingId(request.getBookingId());
            }

            return ResponseEntity.ok(
                    new UpdateStatusResponse(request.getBookingId(), updated.size(), deletedCount, "Status updated successfully")
            );
        } catch (Exception ex) {
            // Log lỗi server (nên dùng logger thực tế)
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new UpdateStatusResponse(request.getBookingId(), 0, 0, "Internal server error: " + ex.getMessage()));
        }
    }

    @Value
    static class UpdateStatusResponse {
        Integer bookingId;
        int updatedCount;
        int deletedCount;
        String message;
    }
}

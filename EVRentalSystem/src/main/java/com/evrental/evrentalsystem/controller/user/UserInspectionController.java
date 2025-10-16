package com.evrental.evrentalsystem.controller.user;
import com.evrental.evrentalsystem.entity.Inspection;
import com.evrental.evrentalsystem.repository.InspectionRepository;
import com.evrental.evrentalsystem.service.InspectionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
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
    @Data
    public static class BookingIdRequest {
        private Integer bookingId;
    }

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
}

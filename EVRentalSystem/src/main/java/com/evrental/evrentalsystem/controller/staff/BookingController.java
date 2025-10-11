package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.response.ApiResponse;
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
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private StaffService staffService;

    // API GET để lấy danh sách bookings theo stationId
    @GetMapping("/station/{stationId}")
    public List<BookingsInStationResponse> getBookingsByStation(@PathVariable Integer stationId) {
        return staffService.bookingsInStation(stationId);
    }

    //API đổi status của booking theo id, ví dụ: PUT http://localhost:8084/EVRentalSystem/api/bookings/1/status?status=Pending_Deposit_Confirmation
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateBookingStatus(
            @PathVariable int id,
            @RequestParam String status) {

        try {
            boolean updated = staffService.changeStatus(id, status);

            if (!updated) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Booking not found with ID: " + id, null));
            }

            return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", null));

        } catch (Exception e) {
            log.error("❌ Error updating booking status for id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating booking status", null));
        }
    }
}

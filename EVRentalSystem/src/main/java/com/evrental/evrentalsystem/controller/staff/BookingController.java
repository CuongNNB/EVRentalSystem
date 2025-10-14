package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.request.ConfirmDepositPaymentRequest;
import com.evrental.evrentalsystem.response.ApiResponse;
import com.evrental.evrentalsystem.response.staff.BookingDetailsByBookingResponse;
import com.evrental.evrentalsystem.response.staff.RenterDetailsByBookingResponse;
import com.evrental.evrentalsystem.response.staff.VehicleIdAndLicensePlateResponse;
import com.evrental.evrentalsystem.service.BookingService;
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

    @Autowired
    private com.evrental.evrentalsystem.service.BookingService bookingService;

    // API GET để lấy danh sách bookings theo stationId
    // GET http://localhost:8084/EVRentalSystem/api/bookings/station/1
    @GetMapping("/station/{stationId}")
    public ResponseEntity<ApiResponse<List<BookingsInStationResponse>>> getBookingsByStation(@PathVariable Integer stationId) {
        try {
            List<BookingsInStationResponse> bookings = staffService.bookingsInStation(stationId);

            if (bookings == null || bookings.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No bookings found for station ID: " + stationId, null));
            }

            return ResponseEntity.ok(ApiResponse.success("Bookings fetched successfully", bookings));

        } catch (Exception e) {
            log.error("❌ Error fetching bookings for station ID {}: {}", stationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching bookings", null));
        }
    }

    // API đổi status của booking theo id
    // PUT http://localhost:8084/EVRentalSystem/api/bookings/1/status?status=Pending_Deposit_Confirmation
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

    @PostMapping("/confirm-deposit")
    public ResponseEntity<String> confirmDeposit(@RequestBody ConfirmDepositPaymentRequest request) {
        String result = bookingService.confirmDepositPayment(request);
        return ResponseEntity.ok(result);
    }

    //API lấy thông tin người dùng theo bookingId
    //
    @GetMapping("/{bookingId}/renter-details")
    public ResponseEntity<ApiResponse<RenterDetailsByBookingResponse>> getRenterDetailsByBooking(
            @RequestParam int bookingId
    ) {
        RenterDetailsByBookingResponse response = staffService.getRenterDetailsByBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người thuê thành công", response));
    }

    //API lấy thông tin chi tiết booking theo bookingId
    @GetMapping("/{bookingId}/booking-details")
    public ResponseEntity<ApiResponse<BookingDetailsByBookingResponse>> getBookingDetailsByBooking(
            @RequestParam int bookingId
    ) {
        BookingDetailsByBookingResponse response = staffService.getBookingDetailsByBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin chi tiết đơn thuê thành công", response));
    }


}

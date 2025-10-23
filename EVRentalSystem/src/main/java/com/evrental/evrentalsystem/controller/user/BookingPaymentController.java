package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.entity.Payment;
import com.evrental.evrentalsystem.request.UpdatePaymentRequest;
import com.evrental.evrentalsystem.service.BookingPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingPaymentController {

    private final BookingPaymentService bookingPaymentService;

    /// PUT API: http://localhost:8084/EVRentalSystem/api/bookings/{bookingId}/payment
    /// RequestBody gồm có:
    /// bookingId: Integer
    /// promotionId: Integer (nullable)
    /// totalCharge: double

    @PutMapping("/payment")
    public ResponseEntity<Map<String, Object>> updateBookingPayment(@RequestBody UpdatePaymentRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            bookingPaymentService.updateBookingAndPayment(request);

            response.put("code", 200);
            response.put("message", "Booking and payment updated successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("code", 400);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (NoSuchElementException e) {
            response.put("code", 404);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);

        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

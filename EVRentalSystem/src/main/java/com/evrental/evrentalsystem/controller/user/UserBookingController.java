package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.User;
import com.evrental.evrentalsystem.request.BookingRequest;
import com.evrental.evrentalsystem.response.ApiResponse;
import com.evrental.evrentalsystem.service.BookingService;
import com.evrental.evrentalsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class UserBookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    // Helper method to find user by email
    private User findUserByEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        return userOptional.get();
    }

    // Tạo booking mới
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Booking>> createBooking(@RequestBody BookingRequest request) {
        User user;
        try {
            user = findUserByEmail(request.getEmail());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), null));
        }

        // Tạo booking từ service với đối tượng User
        Booking booking = bookingService.createBooking(user, request);

        // Trả về phản hồi thành công
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
    }

    // Tìm booking theo email người dùng
    @GetMapping("/findByEmail")
    public ResponseEntity<ApiResponse<Booking>> findBookingByEmail(@RequestParam String email) {
        User user;
        try {
            user = findUserByEmail(email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), null));
        }

        // Tìm booking của người dùng theo email
        Booking booking;
        try {
            booking = bookingService.findBookingByUserEmail(user.getEmail());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), null));
        }

        // Trả về phản hồi thành công
        return ResponseEntity.ok(ApiResponse.success("Booking found", booking));
    }

    // Tìm tất cả các booking theo trạng thái
    @GetMapping("/findByStatus")
    public ResponseEntity<ApiResponse<List<Booking>>> findBookingsByStatus(@RequestParam String status) {
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Status cannot be null or empty", null));
        }

        List<Booking> bookings = bookingService.findBookingsByStatus(status);

        if (bookings.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("No bookings found for this status", null));
        }

        return ResponseEntity.ok(ApiResponse.success("Bookings found", bookings));
    }
}

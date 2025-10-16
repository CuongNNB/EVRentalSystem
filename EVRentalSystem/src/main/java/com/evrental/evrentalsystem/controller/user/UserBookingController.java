    package com.evrental.evrentalsystem.controller.user;


    import com.evrental.evrentalsystem.request.BookingRequest;
    import com.evrental.evrentalsystem.response.user.BookingDetailResponse;
    import com.evrental.evrentalsystem.response.user.BookingResponseDTO;

    import com.evrental.evrentalsystem.service.BookingService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/user")
    @RequiredArgsConstructor
    public class UserBookingController {

        private final BookingService bookingService;
        //API: http://localhost:8084/EVRentalSystem/api/user/booking
        @PostMapping("/booking")
        public BookingResponseDTO createBooking(@RequestBody BookingRequest request) {
            return bookingService.createBooking(request);
        }
        //API: http://localhost:8084/EVRentalSystem/api/user/booking-history/{userId}
        @GetMapping("/booking-history/{userId}")
        public ResponseEntity<List<BookingDetailResponse>> getUserBookings(@PathVariable Integer userId) {
            List<BookingDetailResponse> result = bookingService.getUserBookings(userId);
            return ResponseEntity.ok(result);
        }


    }

    package com.evrental.evrentalsystem.controller.user;


    import com.evrental.evrentalsystem.request.BookingRequest;
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

        @GetMapping("/bookings")
        public ResponseEntity<List<BookingResponseDTO>> getUserBookings(
                @RequestParam Integer userId,
                @RequestParam(required = false) String status,
                @RequestParam(required = false) String search
        ) {
            List<BookingResponseDTO> bookings = bookingService.getUserBookings(userId, status, search);
            return ResponseEntity.ok(bookings);
        }

        @GetMapping("/bookings/{bookingId}")
        public ResponseEntity<BookingResponseDTO> getBookingDetail(
                @PathVariable Integer bookingId
        ) {
            BookingResponseDTO booking = bookingService.getBookingDetail(bookingId);
            return ResponseEntity.ok(booking);
        }
    }

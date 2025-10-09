package com.evrental.evrentalsystem.controller.user;


import com.evrental.evrentalsystem.request.BookingRequest;
import com.evrental.evrentalsystem.response.user.BookingResponseDTO;

import com.evrental.evrentalsystem.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserBookingController {

    private final BookingService bookingService;

    @PostMapping("/booking")
    public BookingResponseDTO createBooking(@RequestBody BookingRequest request) {
        return bookingService.createBooking(request);
    }
}

package com.evrental.evrentalsystem.controller.staff;

import com.evrental.evrentalsystem.service.StaffService;
import com.evrental.evrentalsystem.response.staff.BookingsInStationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}

package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.*;
import com.evrental.evrentalsystem.enums.BookingStatus;
import com.evrental.evrentalsystem.repository.*;
import com.evrental.evrentalsystem.request.BookingRequest;
import com.evrental.evrentalsystem.request.ConfirmDepositPaymentRequest;
import com.evrental.evrentalsystem.response.user.BookingResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class    BookingService {

    private final UserRepository userRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final VehicleDetailRepository vehicleDetailRepository;
    private final StationRepository stationRepository;
    private final BookingRepository bookingRepository;

    public BookingResponseDTO createBooking(BookingRequest request) {
        BookingResponseDTO response = new BookingResponseDTO();

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        VehicleModel model = vehicleModelRepository.findById(request.getVehicleModelId())
                .orElseThrow(() -> new RuntimeException("Vehicle model not found"));

        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));

        VehicleDetail vehicleDetail = vehicleDetailRepository
                .findFirstByVehicleModelAndStatus(model, "AVAILABLE")
                .orElse(null);

        if (vehicleDetail == null) {
            response.setMessage("No available vehicle for this model");
            return response;
        }

        // Tính số ngày thuê
        long days = ChronoUnit.DAYS.between(request.getStartTime(), request.getExpectedReturnTime());
        if (days <= 0) days = 1; // Nếu thuê trong cùng ngày, tính 1 ngày

        double totalAmount = model.getPrice() * days * 1000;

        Booking booking = new Booking();
        booking.setRenter(user);
        booking.setVehicleModel(model);
        booking.setVehicleDetail(vehicleDetail);
        booking.setStation(station);
        booking.setStartTime(request.getStartTime());
        booking.setExpectedReturnTime(request.getExpectedReturnTime());
        booking.setStatus(BookingStatus.Pending_Deposit_Confirmation.toString());
        booking.setDeposit(request.getDeposit());
        booking.setRentalAmount(model.getPrice());
        booking.setTotalAmount(totalAmount);

        bookingRepository.save(booking);
        //set status to avoid double booking
        vehicleDetail.setStatus("RESERVED");
        vehicleDetailRepository.save(vehicleDetail);

        // Mapping sang response
        response.setBookingId(booking.getBookingId());
        response.setUserId(user.getUserId());
        response.setRenterName(user.getFullName());
        response.setVehicleId(request.getVehicleModelId());
        response.setVehicleModel(model.getModel());
        response.setStationName(station.getStationName());
        response.setStatus(booking.getStatus());
        response.setTotalAmount(totalAmount);
        response.setMessage("Booking created successfully");

        return response;
    }
    public String confirmDepositPayment(ConfirmDepositPaymentRequest request) {
        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Not found booking!"));
//
        if (!booking.getStatus().equals(BookingStatus.Pending_Deposit_Confirmation.toString())) {
            return "Booking is not in Pending_Deposit_Confirmation status.";
        }

        booking.setStatus(BookingStatus.Pending_Contract_Signing.toString());
        bookingRepository.save(booking);

        return "Booking confirmed successfully.";
    }
    //API get user Booking

}
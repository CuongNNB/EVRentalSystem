package com.evrental.evrentalsystem.response.user;

import com.evrental.evrentalsystem.entity.Booking;
import lombok.Data;

@Data
public class BookingResponseDTO {
    private Integer bookingId;
    private Integer userId;
    private String renterName;
    private Integer vehicleId;
    private String vehicleModel;
    private String stationName;
    private String status;
    private double totalAmount;
    private String message;

}
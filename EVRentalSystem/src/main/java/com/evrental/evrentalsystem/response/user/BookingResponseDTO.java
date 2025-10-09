package com.evrental.evrentalsystem.response.user;

import lombok.Data;

@Data
public class BookingResponseDTO {
    private Integer bookingId;
    private String userName;
    private String vehicleModel;
    private String stationName;
    private String status;
    private double totalAmount;
    private String message;
}
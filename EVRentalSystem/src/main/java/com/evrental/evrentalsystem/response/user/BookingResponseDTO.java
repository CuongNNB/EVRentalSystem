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


    // For list item
    public static BookingResponseDTO fromListItem(Booking b) {
        BookingResponseDTO dto = baseFrom(b);
        dto.setMessage("Fetched successfully");
        return dto;
    }

    // For detailed view
    public static BookingResponseDTO fromDetail(Booking b) {
        BookingResponseDTO dto = baseFrom(b);
        dto.setMessage("Booking detail fetched successfully");
        return dto;
    }

    private static BookingResponseDTO baseFrom(Booking b) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setBookingId(b.getBookingId());
        dto.setUserId(b.getRenter().getUserId());
        dto.setRenterName(b.getRenter().getFullName());
        dto.setVehicleId(b.getVehicleModel().getVehicleId());
        dto.setVehicleModel(b.getVehicleModel().getModel());
        dto.setStationName(b.getStation().getStationName());
        dto.setStatus(b.getStatus());
        dto.setTotalAmount(b.getTotalAmount() != null ? b.getTotalAmount() : 0);
        return dto;
    }
}
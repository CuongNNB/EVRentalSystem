package com.evrental.evrentalsystem.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingAdminDto {
    private Integer bookingId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime startTime;
    private LocalDateTime expectedReturnTime;
    private LocalDateTime actualReturnTime;
    private Double deposit;

    // user / station / vehicle info
    private Integer renterId;
    private String renterName;     // <- tên hiển thị user
    private Integer stationId;
    private String stationName;

    private Integer vehicleDetailId;
    private String licensePlate;

    private Integer vehicleModelId;
    private String vehicleBrand;
    private String vehicleModel;

    // payment total (mapped from Payment.total)
    private Double paymentTotal;
}
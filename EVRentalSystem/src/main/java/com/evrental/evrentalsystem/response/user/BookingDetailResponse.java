package com.evrental.evrentalsystem.response.user;

import lombok.Data;
import java.time.LocalDateTime;
@Data
public class BookingDetailResponse {
    private Integer bookingId;
    private String vehicleModel;
    private String brand;
    private String color;
    private Integer seats;
    private String batteryCapacity;
    private Integer odo;
    private String licensePlate;
    private String stationName;
    private String stationAddress;
    private String promotionId;
    private LocalDateTime createdAt;
    private LocalDateTime startTime;
    private LocalDateTime expectedReturnTime;
    private LocalDateTime actualReturnTime;
    private double deposit;
    private String bookingStatus;
}

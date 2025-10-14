package com.evrental.evrentalsystem.response.staff;

import com.evrental.evrentalsystem.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BookingDetailsByBookingResponse {
    String modelName;
    String licensePlate;
    int bookingId;
    LocalDateTime startDate;
    LocalDateTime endDate;
    BookingStatus status;
    String stationName;
    int rentingDurationDay;
    int fee;
    int deposit;
    int additionalFee;
    int totalAmount;
}

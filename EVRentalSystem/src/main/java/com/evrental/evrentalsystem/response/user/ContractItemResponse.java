package com.evrental.evrentalsystem.response.user;

import java.time.LocalDateTime;

public record ContractItemResponse(
        Integer contractId,
        String status,

        // Booking info
        Integer bookingId,
        String vehicleModel,
        LocalDateTime startTime,
        LocalDateTime expectedReturnTime,
        String bookingStatus,
        String licensePlate,
        Integer stationId,
        String stationName,

        // Staff info (nullable)
        Integer staffId,
        String staffName,
        String staffEmail
) {}

package com.evrental.evrentalsystem.request;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequest {
    private Integer userId;
    private Integer vehicleModelId;
    private Integer stationId;
    private LocalDateTime startTime;
    private LocalDateTime expectedReturnTime;
}

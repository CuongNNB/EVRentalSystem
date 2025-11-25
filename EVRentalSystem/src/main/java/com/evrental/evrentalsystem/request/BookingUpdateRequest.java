package com.evrental.evrentalsystem.request;

import com.evrental.evrentalsystem.enums.BookingStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingUpdateRequest {
    private Integer bookingId; // Bắt buộc

    // Các trường update
    private Integer vehicleModelId;  // Chỉ được sửa khi chưa cọc
    private Integer vehicleDetailId; // Được sửa ở các bước Pre-Pickup
    // private Integer stationId;    // ĐÃ XÓA: Không cho phép cập nhật trạm qua API này

    private LocalDateTime startTime;
    private LocalDateTime expectedReturnTime;
    private LocalDateTime actualReturnTime;

    private BookingStatus status;
}
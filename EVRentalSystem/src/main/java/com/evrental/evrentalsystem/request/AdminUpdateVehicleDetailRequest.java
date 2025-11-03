package com.evrental.evrentalsystem.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tất cả field optional: chỉ cập nhật field != null.
 * picture: gửi base64 (có thể có header data:image/..., hàm parse sẽ loại bỏ header)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateVehicleDetailRequest {
    private String licensePlate;
    private String batteryCapacity;
    private Integer odo;
    private String picture;
    private String status;
    private String color;
    private Integer vehicleId;
    private Integer stationId;
}

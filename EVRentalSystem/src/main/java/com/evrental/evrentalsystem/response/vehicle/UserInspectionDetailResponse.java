package com.evrental.evrentalsystem.response.vehicle;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInspectionDetailResponse {
    private Integer inspectionId;
    private Integer bookingId;
    private String partName;
    private String description;
    private Integer staffId;
    private String staffName;
    private LocalDateTime inspectedAt;
    private String status;
    private String pictureUrl;
}

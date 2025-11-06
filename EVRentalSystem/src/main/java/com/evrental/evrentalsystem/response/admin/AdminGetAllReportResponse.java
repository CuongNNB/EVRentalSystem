package com.evrental.evrentalsystem.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminGetAllReportResponse {
    private Integer reportId;
    private String description;
    private String status;
    private LocalDateTime createdAt;

    private Integer staffId;
    private String staffName;

    private Integer vehicleDetailId;
    private String licensePlate;

    private String stationName;
}
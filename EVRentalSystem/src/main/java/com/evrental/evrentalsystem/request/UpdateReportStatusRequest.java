package com.evrental.evrentalsystem.request;

import lombok.Data;

@Data
public class UpdateReportStatusRequest {
    private Integer reportId;
    private String status;
}
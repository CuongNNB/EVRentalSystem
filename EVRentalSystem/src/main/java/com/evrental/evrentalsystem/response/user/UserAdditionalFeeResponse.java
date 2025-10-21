package com.evrental.evrentalsystem.response.user;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserAdditionalFeeResponse {
    private Integer feeId;
    private Integer bookingId;
    private String feeName;
    private Double amount;
    private String description;
    private LocalDateTime createdAt;
}

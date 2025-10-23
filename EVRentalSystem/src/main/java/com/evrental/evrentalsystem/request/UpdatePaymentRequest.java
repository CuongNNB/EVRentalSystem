package com.evrental.evrentalsystem.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentRequest {
    private Integer bookingId;
    private Integer promotionId;
    private Double totalCharged;
}

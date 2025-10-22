package com.evrental.evrentalsystem.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentResponse {
    private boolean success;
    private String message;
    private Integer paymentId;
}

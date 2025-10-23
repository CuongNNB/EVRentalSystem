package com.evrental.evrentalsystem.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {
    private Integer promotionId;
    private String promoName;
    private String code;
    private Double discountPercent;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
}

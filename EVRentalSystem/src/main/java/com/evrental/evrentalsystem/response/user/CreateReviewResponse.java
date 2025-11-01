package com.evrental.evrentalsystem.response.user;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewResponse {
    private Integer reviewId;
    private Integer bookingId;
    private Integer renterId;
    private String renterName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}

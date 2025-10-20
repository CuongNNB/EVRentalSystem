package com.evrental.evrentalsystem.response.admin;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RecentRentalsResponse {
    private List<RentalRow> rentals;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RentalRow {
        private Long rentalId;
        private String customerName;
        private String vehicleCode;
        private String startTime; // ISO-8601
        private String endTime;   // ISO-8601, có thể null
        private String status;    // ONGOING/COMPLETED/CANCELLED
        private Long price;       // VND, có thể null
    }
}
//
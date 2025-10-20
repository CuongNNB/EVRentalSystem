package com.evrental.evrentalsystem.response.admin;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OverviewMetricsResponse {
    private long totalRevenue;      // tổng doanh thu (VND)
    private int rentalsToday;       // lượt thuê hôm nay
    private int totalCustomers;     // số khách hàng
    private double utilizationRate; // 0..1

    private Delta delta;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Delta {
        private Double revenue; // ví dụ: 0.185 => +18.5%
        private Double rentals; // ví dụ: 0.052 => +5.2%
    }
}
//
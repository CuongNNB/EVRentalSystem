package com.evrental.evrentalsystem.response.admin;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RevenueSeriesResponse {
    private List<Point> points;
    private long total; // tổng doanh thu trong khoảng

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Point {
        private String date;   // YYYY-MM-DD
        private long revenue;  // VND
    }
}
//
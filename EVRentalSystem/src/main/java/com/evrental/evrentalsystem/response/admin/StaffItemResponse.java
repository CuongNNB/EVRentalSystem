package com.evrental.evrentalsystem.response.admin;

import lombok.*;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StaffItemResponse {

    private List<StaffItem> data;
    private Kpis kpis;
    private int page;
    private int size;
    private long total;


    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StaffItem {
        private Integer id;
        private String name;
        private String email;
        private String position;
        private String status;
        private Integer stationId;
        private String stationName;

        private Integer handovers;
        private Double avgRating;
        private Integer onTimeRate;
        private Integer customerSatisfaction;
        private Integer shiftsThisMonth;
        private Integer shiftsTotal;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Kpis {
        private long totalStaff;
        private long activeCount;
        private double avgRating;
        private long totalHandovers;
    }
}

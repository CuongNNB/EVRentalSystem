package com.evrental.evrentalsystem.response.admin;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TopStationsResponse {
    private List<StationRow> stations;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StationRow {
        private Integer stationId;
        private String stationName;
        private int rentals;
        private long revenue;        // VND
        private double utilizationRate; // 0..1
    }
}
//
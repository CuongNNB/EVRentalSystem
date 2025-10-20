package com.evrental.evrentalsystem.response.admin;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityFeedResponse {
    private List<Activity> activities;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Activity {
        private String time;    // ISO-8601
        private String type;    // RENTAL/RETURN/MAINTENANCE/ALERT/...
        private String message; // mô tả sự kiện
    }
}
//
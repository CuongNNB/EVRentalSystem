package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.response.admin.*;
import com.evrental.evrentalsystem.response.vehicle.FixingVehicleResponse;
import com.evrental.evrentalsystem.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/admin")
@CrossOrigin(
        origins = "http://localhost:8084",
        allowCredentials = "false"
)
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboard;

    // ===== Overview =====
    @GetMapping("/overview/metrics")
    public OverviewMetricsResponse getMetrics(@RequestParam(required = false) String from,
                                              @RequestParam(required = false) String to) {
        return dashboard.getOverviewMetrics(from, to);
    }

    @GetMapping("/overview/revenue-series")
    public RevenueSeriesResponse getRevenueSeries(@RequestParam(required = false) Integer period,
                                                  @RequestParam(required = false) String from,
                                                  @RequestParam(required = false) String to) {
        return dashboard.getRevenueSeries(period, from, to);
    }

    @GetMapping("/overview/top-stations")
    public TopStationsResponse getTopStations(@RequestParam(required = false) Integer limit,
                                              @RequestParam(required = false) String from,
                                              @RequestParam(required = false) String to) {
        return dashboard.getTopStations(limit, from, to);
    }

    @GetMapping("/overview/recent-rentals")
    public RecentRentalsResponse getRecentRentals(@RequestParam(required = false, defaultValue = "10") Integer limit) {
        return dashboard.getRecentRentals(limit);
    }

    @GetMapping("/overview/activity")
    public ActivityFeedResponse getActivity(@RequestParam(required = false, defaultValue = "10") Integer limit) {
        return dashboard.getActivityFeed(limit);
    }

    @GetMapping("/overview/export")
    public ResponseEntity<byte[]> exportOverview(@RequestParam(required = false) String from,
                                                 @RequestParam(required = false) String to,
                                                 @RequestParam(required = false, defaultValue = "csv") String format) {
        return dashboard.exportOverview(from, to, format);
    }
}

package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.response.admin.*;
import com.evrental.evrentalsystem.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminOverviewController {

    private final AdminService adminService;

    // KPI: tổng doanh thu, lượt thuê hôm nay, KH, tỉ lệ sử dụng + delta %
    @GetMapping("/overview/metrics")
    public ResponseEntity<OverviewMetricsResponse> getOverviewMetrics(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(adminService.getOverviewMetrics(from, to));
    }

    // Chuỗi doanh thu theo ngày (period hoặc from/to)
    @GetMapping("/overview/revenue-series")
    public ResponseEntity<RevenueSeriesResponse> getRevenueSeries(
            @RequestParam(required = false, defaultValue = "7") Integer period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(adminService.getRevenueSeries(period, from, to));
    }

    // Top trạm theo rentals/revenue/utilization
    @GetMapping("/overview/top-stations")
    public ResponseEntity<TopStationsResponse> getTopStations(
            @RequestParam(required = false, defaultValue = "5") Integer limit,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(adminService.getTopStations(limit, from, to));
    }

    // Lượt thuê gần đây
    @GetMapping("/overview/recent-rentals")
    public ResponseEntity<RecentRentalsResponse> getRecentRentals(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(adminService.getRecentRentals(limit));
    }

    // Activity feed
    @GetMapping("/overview/activity")
    public ResponseEntity<ActivityFeedResponse> getActivity(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(adminService.getActivityFeed(limit));
    }

    // Export (service set Content-Type + headers)
    @GetMapping("/overview/export")
    public ResponseEntity<byte[]> exportOverview(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false, defaultValue = "csv") String format) {
        return adminService.exportOverview(from, to, format);
    }
}

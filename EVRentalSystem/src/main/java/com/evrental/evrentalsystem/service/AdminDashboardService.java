package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.response.admin.*;
import com.evrental.evrentalsystem.response.vehicle.FixingVehicleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private final DashboardOverviewService overview;
    private final DashboardStationService station;
    private final DashboardRecentService recent;
    private final DashboardActivityService activity;
    private final DashboardExportService export;

    // Tổng quan dashboard APIs
    public OverviewMetricsResponse getOverviewMetrics(String from, String to) {
        return overview.metrics(from, to);
    }
    public RevenueSeriesResponse getRevenueSeries(Integer period, String from, String to) {
        return overview.revenueSeries(period, from, to);
    }
    public TopStationsResponse getTopStations(Integer limit, String from, String to) {
        return station.topStations(limit, from, to);
    }
    public RecentRentalsResponse getRecentRentals(Integer limit) {
        return recent.recent(limit != null ? limit : 10);
    }
    public ActivityFeedResponse getActivityFeed(Integer limit) {
        return activity.feed(limit != null ? limit : 10);
    }
    public ResponseEntity<byte[]> exportOverview(String from, String to, String format) {
        return export.exportOverview(from, to, format);
    }

    // Station vehicle APIs
    public TotalVehicleResponse getTotalVehiclesByStation(Integer stationId) {
        return station.totalByStation(stationId);
    }
    public RentedVehicleResponse getRentedVehiclesByStation(Integer stationId) {
        return station.rentedByStation(stationId);
    }
    public FixingVehicleResponse getFixingVehiclesByStation(Integer stationId) {
        return station.fixingByStation(stationId);
    }
}

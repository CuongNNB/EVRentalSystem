package com.evrental.evrentalsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class DashboardExportService {
    private final DashboardOverviewService overview;

    public ResponseEntity<byte[]> exportOverview(String from, String to, String format) {
        var series = overview.revenueSeries(null, from, to);
        StringBuilder sb = new StringBuilder("date,revenue\n");
        for (var p : series.getPoints()) {
            sb.append(p.getDate()).append(",").append(p.getRevenue()).append("\n");
        }
        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);

        var headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"overview.csv\"");

        return ResponseEntity.ok().headers(headers).body(bytes);
    }
}

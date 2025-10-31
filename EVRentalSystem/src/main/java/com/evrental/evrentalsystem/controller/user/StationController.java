package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.response.admin.TopStationsResponse;
import com.evrental.evrentalsystem.response.vehicle.VehicleAtStationResponse;
import com.evrental.evrentalsystem.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;
    private final DataSource dataSource;


    @GetMapping("/{stationId}/models")
    public ResponseEntity<List<VehicleAtStationResponse>> getVehicleModelsByStation(
            @PathVariable("stationId") Integer stationId) {

        List<VehicleAtStationResponse> models = stationService.getModelsByStation(stationId);
        if (models.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(models);
    }

    @GetMapping
    public List<Map<String, Object>> listAll() {
        String sql = "SELECT station_id, station_name FROM Station ORDER BY station_name ASC";
        List<Map<String, Object>> out = new ArrayList<>();
        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                out.add(Map.of(
                        "id", rs.getInt("station_id"),
                        "name", rs.getString("station_name")
                ));
            }
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Load stations failed", e);
        }
        return out;
    }
}

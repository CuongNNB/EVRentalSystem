package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.response.vehicle.VehicleAtStationResponse;
import com.evrental.evrentalsystem.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;


    @GetMapping("/{stationId}/models")
    public ResponseEntity<List<VehicleAtStationResponse>> getVehicleModelsByStation(
            @PathVariable("stationId") Integer stationId) {

        List<VehicleAtStationResponse> models = stationService.getModelsByStation(stationId);
        if (models.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(models);
    }
}

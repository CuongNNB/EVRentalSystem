package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.request.CreateStaffRequest;
import com.evrental.evrentalsystem.request.StaffPatchRequest;
import com.evrental.evrentalsystem.request.TransferStationRequest;
import com.evrental.evrentalsystem.response.admin.CreateStaffResponse;
import com.evrental.evrentalsystem.response.admin.StaffItemResponse;
import com.evrental.evrentalsystem.service.StaffAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/staff")
@RequiredArgsConstructor
@CrossOrigin // chỉnh origins nếu cần
public class StaffAdminController {

    private final StaffAdminService staffAdminService;

    @GetMapping
    public StaffItemResponse list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer stationId,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return staffAdminService.getStaffList(search, stationId, position, status, page, size);
    }

    @GetMapping("/{id}")
    public StaffItemResponse.StaffItem detail(@PathVariable int id) {
        return staffAdminService.getStaffDetail(id);
    }

    @PostMapping("/{id}/transfer-station")
    public ResponseEntity<?> transferStation(
            @PathVariable int id,
            @RequestBody TransferStationRequest req) {

        if (req == null || req.getStationId() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "stationId is required"
            ));
        }

        staffAdminService.transferStation(id, req.getStationId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Transferred",
                "staffId", id,
                "stationId", req.getStationId()
        ));
    }

    @PatchMapping("/{id}")
    public StaffItemResponse.StaffItem updateStaffBasicInfo(
            @PathVariable int id,
            @RequestBody StaffPatchRequest req
    ) {
        return staffAdminService.patchStaff(
                id,
                req.getEmail(),
                req.getPhone(),
                req.getStatus(),
                null
        );
    }

    @PostMapping
    public ResponseEntity<CreateStaffResponse> createStaff(@RequestBody CreateStaffRequest req) {
        CreateStaffResponse created = staffAdminService.createStaff(req);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable int id) {
        staffAdminService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}

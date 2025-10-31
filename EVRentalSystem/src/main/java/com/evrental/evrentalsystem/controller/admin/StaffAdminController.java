package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.request.CreateStaffRequest;
import com.evrental.evrentalsystem.response.admin.CreateStaffResponse;
import com.evrental.evrentalsystem.response.admin.StaffItemResponse;
import com.evrental.evrentalsystem.service.StaffAdminService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.evrental.evrentalsystem.request.TransferStationRequest;
import com.evrental.evrentalsystem.request.StaffPatchRequest;

import java.io.ByteArrayOutputStream;
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

    // phần này export excel
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer stationId,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) String status
    ) {
        var payload = staffAdminService.getStaffList(search, stationId, position, status, 1, 10_000);

        try (var wb = new XSSFWorkbook(); var out = new ByteArrayOutputStream()) {
            var sheet = wb.createSheet("Staff");
            int r = 0;

            // header
            var header = sheet.createRow(r++);
            String[] heads = {
                    "ID", "Name", "Email", "Position", "Status", "Station",
                    "Handovers", "AvgRating", "OnTime(%)", "Satisfaction(%)", "ShiftsMonth", "ShiftsTotal"
            };
            for (int i = 0; i < heads.length; i++) header.createCell(i).setCellValue(heads[i]);

            // rows
            for (var it : payload.getData()) {
                var row = sheet.createRow(r++);
                int c = 0;
                row.createCell(c++).setCellValue(it.getId() != null ? it.getId() : 0);
                row.createCell(c++).setCellValue(nullToEmpty(it.getName()));
                row.createCell(c++).setCellValue(nullToEmpty(it.getEmail()));
                row.createCell(c++).setCellValue(nullToEmpty(it.getPosition()));
                row.createCell(c++).setCellValue(nullToEmpty(it.getStatus()));
                row.createCell(c++).setCellValue(nullToEmpty(it.getStationName()));
                row.createCell(c++).setCellValue(it.getHandovers() != null ? it.getHandovers() : 0);
                row.createCell(c++).setCellValue(it.getAvgRating() != null ? it.getAvgRating() : 0d);
                row.createCell(c++).setCellValue(it.getOnTimeRate() != null ? it.getOnTimeRate() : 0);
                row.createCell(c++).setCellValue(it.getCustomerSatisfaction() != null ? it.getCustomerSatisfaction() : 0);
                row.createCell(c++).setCellValue(it.getShiftsThisMonth() != null ? it.getShiftsThisMonth() : 0);
                row.createCell(c++).setCellValue(it.getShiftsTotal() != null ? it.getShiftsTotal() : 0);
            }
            for (int i = 0; i < heads.length; i++) sheet.autoSizeColumn(i);

            wb.write(out);
            var bytes = out.toByteArray();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=staff.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(bytes.length)
                    .body(bytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Export failed: " + e.getMessage()).getBytes());
        }
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
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
}

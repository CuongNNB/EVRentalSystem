package com.evrental.evrentalsystem.controller.admin;

import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.entity.VehicleModel;
import com.evrental.evrentalsystem.enums.VehicleStatus;
import com.evrental.evrentalsystem.request.*;
import com.evrental.evrentalsystem.response.admin.*;
import com.evrental.evrentalsystem.service.VehicleManagementService;
import com.evrental.evrentalsystem.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vehicle-management")
@RequiredArgsConstructor
public class VehicleManagementController {

    private final VehicleManagementService vehicleManagementService;

    // <editor-fold desc="This is the section for vehicle detail management">
    //API: http://localhost:8084/EVRentalSystem/vehicle-management/vehicles
    @GetMapping("/vehicles")
    public ResponseEntity<List<AdminVehicleModelResponse>> getAllVehicles() {
        List<AdminVehicleModelResponse> results = vehicleManagementService.getAllVehiclesGroupedByModel();
        return ResponseEntity.ok(results);
    }

    //API: http://localhost:8084/EVRentalSystem/vehicle-management/details/{vehicleDetailId}
    @GetMapping("/details/{vehicleDetailId}")
    public ResponseEntity<AdminGetAllVehicleDetailResponse> getVehicleDetailById(
            @PathVariable Integer vehicleDetailId) {

        AdminGetAllVehicleDetailResponse resp = vehicleManagementService.getVehicleDetailById(vehicleDetailId);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/image/{vehicleDetailId}/*")
    public ResponseEntity<byte[]> getVehicleDetailImage(@PathVariable Integer vehicleDetailId) {
        VehicleDetail vd = vehicleManagementService.findVehicleDetailEntity(vehicleDetailId);
        byte[] bytes = ImageUtil.decodeBase64(vd.getPicture());
        String mimeType = ImageUtil.detectImageMimeType(bytes);
        return ImageUtil.buildImageResponse(bytes, mimeType);
    }

    //API: http://localhost:8084/EVRentalSystem/api/vehicle-management/{vehicleDetailId}/status
    @PutMapping("/{vehicleDetailId}/status")
    public ResponseEntity<Map<String, String>> updateVehicleDetailStatus(
            @PathVariable Integer vehicleDetailId,
            @RequestBody AdminUpdateVehicleStatusRequest request) {

        String message = vehicleManagementService.updateVehicleDetailStatus(vehicleDetailId, request.getStatus());

        Map<String, String> response = new HashMap<>();
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    //Update xe
    //API: http://localhost:8084/EVRentalSystem/vehicle-management/update-vehicle/{detailId}
    @PutMapping(value = "/update-vehicle/{detailId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> updateVehicleDetail(
            @PathVariable Integer detailId,
            @RequestParam("licensePlate") String licensePlate,
            @RequestParam("batteryCapacity") String batteryCapacity,
            @RequestParam("odo") String odo,
            @RequestParam("color") String color,
            @RequestParam("stationId") Integer stationId,
            @RequestParam("vehicleModelId") Integer vehicleModelId,
            @RequestParam(value = "status") String status,
            @RequestParam(value = "picture", required = false) MultipartFile picture) {

        AdminUpdateVehicleDetailRequest req = new AdminUpdateVehicleDetailRequest();
        req.setDetailId(detailId);
        req.setLicensePlate(licensePlate);
        req.setBatteryCapacity(batteryCapacity);
        req.setOdo(Integer.parseInt(odo));
        req.setColor(color);
        req.setStationId(stationId);
        req.setVehicleModelId(vehicleModelId);
        req.setStatus(VehicleStatus.valueOf(status));

        String message = vehicleManagementService.updateVehicleDetail(req, picture);

        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    //Thêm xe
    //API: http://localhost:8084/EVRentalSystem/api/vehicle-management/create-vehicle
    @PostMapping(value = "/create-vehicle", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> createVehicleDetail(
            @RequestParam("licensePlate") String licensePlate,
            @RequestParam("batteryCapacity") String batteryCapacity,
            @RequestParam("odo") String odo,
            @RequestParam("color") String color,
            @RequestParam("stationId") Integer stationId,
            @RequestParam("vehicleModelId") Integer vehicleModelId,
            @RequestParam("picture") MultipartFile picture) {
        AdminCreateVehicleDetailRequest req = new AdminCreateVehicleDetailRequest();
        req.setLicensePlate(licensePlate);
        req.setBatteryCapacity(batteryCapacity);
        req.setOdo(Integer.parseInt(odo));
        req.setColor(color);
        req.setStationId(stationId);
        req.setVehicleModelId(vehicleModelId);

        String message = vehicleManagementService.createVehicleDetail(req, picture);

        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }
    // </editor-fold>

    // <editor-fold desc="This is the section for vehicle model management">
    //API: http://localhost:8084/EVRentalSystem/vehicle-management/models
    @GetMapping("/models")
    public ResponseEntity<List<AdminGetAllModelResponse>> getAllVehicleModels() {
        List<AdminGetAllModelResponse> models = vehicleManagementService.getAllModels();
        return ResponseEntity.ok(models);
    }

    //API: http://localhost:8084/EVRentalSystem/vehicle-management/models/{modellId}
    @GetMapping("/models/{modellId}")
    public ResponseEntity<AdminGetModelDetailResponse> getVehicleModelById(
            @PathVariable Integer modellId) {
        AdminGetModelDetailResponse resp = vehicleManagementService.getModelDetail(modellId);
        return ResponseEntity.ok(resp);
    }

    //API: http://localhost:8084/EVRentalSystem/vehicle-management/models/brand-model
    @GetMapping("/models/brand-model")
    public ResponseEntity<List<Map<String, String>>> getBrandModelNames() {
        List<VehicleModel> models = vehicleManagementService.findAllVehicleModels();

        List<Map<String, String>> response = models.stream()
                .map(m -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", String.valueOf(m.getVehicleId()));
                    map.put("name", m.getBrand() + " " + m.getModel()); // Ví dụ: "VinFast VF8"
                    return map;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/model-image/{modelId}/*")
    public ResponseEntity<byte[]> getVehicleModelImage(@PathVariable Integer modelId) {
        VehicleModel vd = vehicleManagementService.findVehicleModelEntity(modelId);
        byte[] bytes = ImageUtil.decodeBase64(vd.getPicture());
        String mimeType = ImageUtil.detectImageMimeType(bytes);
        return ImageUtil.buildImageResponse(bytes, mimeType);
    }

    //API: http://localhost:8084/EVRentalSystem/api/vehicle-management/create-model
    @PostMapping(value = "/create-model", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> createVehicleModel(@RequestParam("brand") String brand,
                                                                  @RequestParam("model") String model,
                                                                  @RequestParam("price") Double price,
                                                                  @RequestParam("seats") Integer seats,
                                                                  @RequestParam("modelPicture") MultipartFile modelPicture) {
        AdminCreateVehicleModelRequest req = new AdminCreateVehicleModelRequest();
        req.setBrand(brand);
        req.setModel(model);
        req.setPrice(price);
        req.setSeats(seats);

        String message = vehicleManagementService.createVehicleModel(req, modelPicture);
        Map<String, String> response = new HashMap<>();
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    //API: http://localhost:8084/EVRentalSystem/vehicle-management/update-model/{modelId}
    @PutMapping(value = "/update-model/{modelId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> updateVehicleModel(
            @PathVariable Integer modelId,
            @RequestParam("brand") String brand,
            @RequestParam("model") String model,
            @RequestParam("price") Double price,
            @RequestParam("seats") Integer seats,
            @RequestParam(value = "modelPicture", required = false) MultipartFile modelPicture) {
        AdminUpdateVehicleModelRequest req = new AdminUpdateVehicleModelRequest();
        req.setModelId(modelId);
        req.setBrand(brand);
        req.setModel(model);
        req.setPrice(price);
        req.setSeats(seats);
        String message = vehicleManagementService.updateVehicleModel(req, modelPicture);

        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    //API: http://localhost:8084/EVRentalSystem/vehicle-management/get-all-about-station
    @GetMapping("/get-all-about-station")
    public ResponseEntity<GetAllAboutStationResponse> getAllAboutStation() {
        try {
            GetAllAboutStationResponse response = vehicleManagementService.getAllAboutStation();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    // </editor-fold>

}
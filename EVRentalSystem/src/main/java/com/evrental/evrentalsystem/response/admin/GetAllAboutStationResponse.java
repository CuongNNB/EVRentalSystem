package com.evrental.evrentalsystem.response.admin;

import com.evrental.evrentalsystem.enums.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetAllAboutStationResponse {

    // Đây là list root trả về cho API
    private List<StationDTO> stations;

    // --- Các DTO con ---

    @Data
    @Builder
    public static class StationDTO {
        private Integer stationId;
        private String stationName;
        private List<ModelDTO> models; // Danh sách Model tại trạm này
    }

    @Data
    @Builder
    public static class ModelDTO {
        private Integer vehicleModelId;
        private String brand;
        private String modelName;
        private List<CarDTO> cars; // Danh sách xe cụ thể của Model này
    }

    @Data
    @Builder
    public static class CarDTO {
        private Integer vehicleDetailId;
        private String licensePlate;
        private String color;
        private VehicleStatus status; // Để frontend biết xe nào Available
    }
}
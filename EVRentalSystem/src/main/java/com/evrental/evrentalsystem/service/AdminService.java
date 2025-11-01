package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.*;
import com.evrental.evrentalsystem.repository.RenterDetailRepository;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.UserRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.response.admin.GetAllUserResponse;
import com.evrental.evrentalsystem.response.admin.GetRenterDetailResponse;
import com.evrental.evrentalsystem.response.admin.RentedVehicleResponse;
import com.evrental.evrentalsystem.response.admin.TotalVehicleResponse;
import com.evrental.evrentalsystem.response.user.UserResponse;
import com.evrental.evrentalsystem.response.vehicle.FixingVehicleResponse;
import com.evrental.evrentalsystem.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AdminService {
    private final StationRepository stationRepository;

    private final VehicleDetailRepository vehicleDetailRepository;

    private final UserRepository userRepository;
    private RenterDetailRepository renterDetailRepository;


    //Hàm lấy tổng số xe tại 1 trạm cụ thể cho admin.
    public TotalVehicleResponse getTotalVehiclesByStation(Integer stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạm với ID: " + stationId));

        Long total = vehicleDetailRepository.countVehiclesByStationId(stationId);
        return new TotalVehicleResponse(station.getStationId(), station.getStationName(), total);
    }

    //Hàm lấy tổng số xe đang được thuê (RENTED) ở 1 trạm cụ thể cho ADMIN.
    public RentedVehicleResponse getRentedVehiclesByStation(Integer stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạm với ID: " + stationId));

        Long rented = vehicleDetailRepository.countRentedVehiclesByStationId(stationId);
        return new RentedVehicleResponse(station.getStationId(), station.getStationName(), rented);
    }

    //Hàm lấy các xe đang sửa
    public FixingVehicleResponse getFixingVehiclesByStation(Integer stationId) {
        var station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));

        var vehicles = vehicleDetailRepository.findFixingVehiclesByStation(stationId);

        var vehicleInfoList = vehicles.stream().map(v ->
                new FixingVehicleResponse.VehicleInfo(
                        v.getId(),
                        v.getLicensePlate(),
                        v.getColor(),
                        v.getBatteryCapacity(),
                        v.getVehicleModel().getModel(),
                        v.getStatus()
                )
        ).toList();

        return new FixingVehicleResponse(
                station.getStationName(),
                vehicleInfoList.size(),
                vehicleInfoList
        );
    }


    //GetALllRenter
    public List<GetAllUserResponse> getAllUsersByRole(String role) {
        return userRepository.findByRole(role)
                .stream()
                .map(user -> new GetAllUserResponse(
                        user.getUserId(),
                        user.getUsername(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getAddress(),
                        user.getStatus(),
                        user.getCreatedAt(),
                        user.getRenterDetail().getIsRisky(),
                        user.getRole()
                ))
                .collect(Collectors.toList());
    }

    public Optional<RenterDetail> findByUserId(Integer userId) {
        return renterDetailRepository.findByRenterUserId(userId);
    }

    public GetRenterDetailResponse toDto(RenterDetail e, String baseImageUrl) {
        GetRenterDetailResponse dto = new GetRenterDetailResponse();
        dto.setRenterId(e.getRenterId());
        dto.setVerificationStatus(e.getVerificationStatus());
        dto.setIsRisky(e.getIsRisky());

        // build URL cho từng ảnh (controller truyền baseImageUrl)
        dto.setCccdFrontUrl(baseImageUrl + "?type=cccd_front");
        dto.setCccdBackUrl(baseImageUrl + "?type=cccd_back");
        dto.setDriverLicenseUrl(baseImageUrl + "?type=driver_license");
        return dto;
    }

    public byte[] decodeImage(String base64) {
        return ImageUtil.decodeBase64(base64);
    }

    public String detectMime(byte[] bytes) {
        return ImageUtil.detectImageMimeType(bytes);
    }
    //End code here
}

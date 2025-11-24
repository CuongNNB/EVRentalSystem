package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.*;
import com.evrental.evrentalsystem.enums.RenterDetailVerificationStatusEnum;
import com.evrental.evrentalsystem.enums.ReportStatusEnum;
import com.evrental.evrentalsystem.enums.StaffStatusEnum;
import com.evrental.evrentalsystem.enums.UserEnum;
import com.evrental.evrentalsystem.repository.*;
import com.evrental.evrentalsystem.request.UpdateRenterDetailRequest;
import com.evrental.evrentalsystem.request.UpdateReportStatusRequest;
import com.evrental.evrentalsystem.response.admin.*;
import com.evrental.evrentalsystem.response.vehicle.FixingVehicleResponse;
import com.evrental.evrentalsystem.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
//import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

//@Slf4j
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    private final StationRepository stationRepository;

    private final VehicleDetailRepository vehicleDetailRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RenterDetailRepository renterDetailRepository;
    private final ReportRepository reportRepository;
    private final EmployeeDetailRepository employeeDetailRepository;
    private final PaymentRepository paymentRepository;

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
                        v.getStatus().toString()
                )
        ).toList();

        return new FixingVehicleResponse(
                station.getStationName(),
                vehicleInfoList.size(),
                vehicleInfoList
        );
    }


    //GetALllRenter
    public List<GetAllUserResponse> getAllUsersByRole(UserEnum role) {
        return userRepository.findByRole(role)
                .stream()
                .map(user -> new GetAllUserResponse(
                        user.getUserId(),
                        user.getUsername(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getAddress(),
                        user.getStatus().toString(),
                        user.getCreatedAt(),
                        user.getRenterDetail().getIsRisky(),
                        user.getRole().toString()
                ))
                .collect(Collectors.toList());
    }

    public Optional<RenterDetail> findByUserId(Integer userId) {
        return renterDetailRepository.findByRenterUserId(userId);
    }

    public GetRenterDetailResponse toDto(RenterDetail e, String baseImageUrl) {
        GetRenterDetailResponse dto = new GetRenterDetailResponse();
        dto.setRenterId(e.getRenterId());
        dto.setVerificationStatus(e.getVerificationStatus().toString());
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

    @Transactional
    public RenterDetail updateRenterDetail(UpdateRenterDetailRequest request) {
        Integer userId = request.getUserId();

        // 1️⃣ Lấy user từ DB
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // 2️⃣ Cập nhật các thông tin cơ bản
        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getEmail() != null) user.setEmail(request.getEmail().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        if (request.getStatus() != null) user.setStatus(StaffStatusEnum.valueOf(request.getStatus().toString().trim().toUpperCase()) );

        userRepository.save(user);

        // 3️⃣ Lấy hoặc tạo mới renterDetail
        RenterDetail renterDetail = renterDetailRepository.findByRenterId(userId)
                .orElseGet(() -> RenterDetail.builder()
                        .renterId(userId)
                        .build());

        // 4️⃣ Cập nhật renter detail
        if (request.getIsRisky() != null) renterDetail.setIsRisky(request.getIsRisky());
        if (request.getVerificationStatus() != null)
            renterDetail.setVerificationStatus(RenterDetailVerificationStatusEnum.valueOf(
                    request.getVerificationStatus().trim().toUpperCase()));

        // Nếu entity có quan hệ OneToOne tới User
        try {
            renterDetail.setRenter(user);
        } catch (Exception ignored) {
        }

        // 5️⃣ Lưu vào DB
        return renterDetailRepository.save(renterDetail);
    }

    public List<AdminGetAllReportResponse> getReportsByAdminId(Integer adminId) {
        if (adminId == null) throw new IllegalArgumentException("adminId must not be null");

        List<Report> reports = reportRepository.findByAdmin_UserId(adminId);

        return reports.stream().map(report -> {
            AdminGetAllReportResponse.AdminGetAllReportResponseBuilder b = AdminGetAllReportResponse.builder()
                    .reportId(report.getReportId())
                    .description(report.getDescription())
                    .status(report.getStatus())
                    .createdAt(report.getCreatedAt());

            // Staff info
            if (report.getStaff() != null) {
                b.staffId(report.getStaff().getUserId());
                b.staffName(report.getStaff().getFullName());
            }

            // Vehicle info
            VehicleDetail vd = report.getVehicleDetail();
            if (vd != null) {
                b.vehicleDetailId(vd.getId());
                b.licensePlate(vd.getLicensePlate());
            }

            // Station info (from EmployeeDetail -> Station)
            String stationName = null;
            if (report.getStaff() != null) {
                Integer staffId = report.getStaff().getUserId();
                stationName = employeeDetailRepository.findByEmployee_UserId(staffId)
                        .map(EmployeeDetail::getStation)
                        .map(s -> {
                            try {
                                return s.getStationName(); // update if your field is 'name' instead
                            } catch (Exception ex) {
                                return s.toString();
                            }
                        }).orElse(null);
            }
            b.stationName(stationName);

            return b.build();
        }).collect(Collectors.toList());
    }
    public String updateReportStatus(UpdateReportStatusRequest request) {
        if (request.getReportId() == null || request.getStatus() == null || request.getStatus().isBlank()) {
            return "Invalid request data";
        }

        return reportRepository.findById(request.getReportId())
                .map(report -> {
                    report.setStatus(ReportStatusEnum.valueOf(request.getStatus()));
                    reportRepository.save(report);
                    return "Update report status success";
                })
                .orElse("Update report status failed: report not found");
    }

    public List<BookingAdminDto> getAllBookingsForAdmin() {
        List<Booking> bookings = bookingRepository.findAll();

        return bookings.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private BookingAdminDto mapToDto(Booking booking) {
        BookingAdminDto.BookingAdminDtoBuilder builder = BookingAdminDto.builder();

        builder.bookingId(booking.getBookingId());
        builder.status(booking.getStatus().toString());
        builder.createdAt(booking.getCreatedAt());
        builder.startTime(booking.getStartTime());
        builder.expectedReturnTime(booking.getExpectedReturnTime());
        builder.actualReturnTime(booking.getActualReturnTime());
        builder.deposit(booking.getDeposit());

        // renter (User)
        if (booking.getRenter() != null) {
            try {
                builder.renterId(booking.getRenter().getUserId()); // adjust if your User PK getter name differs
            } catch (Exception e) {
                // If User uses different field name for id, comment above and set manually
                log.debug("Unable to read renterId via getUserId(): {}", e.getMessage());
            }

            // IMPORTANT: change this if your User entity uses another getter (getName/getFullName/getFull_name)
            try {
                builder.renterName(booking.getRenter().getFullName());
            } catch (Exception e) {
                // fallback — try common alternatives (uncomment/change if needed)
                // builder.renterName(booking.getRenter().getName());
                log.debug("Unable to read renterName via getFullName(): {}", e.getMessage());
            }
        }

        // station
        if (booking.getStation() != null) {
            try {
                // common pattern: station.getStationId() / station.getId() as PK
                // and station.getName() as display name. Adjust if your Station uses other names.
                // builder.stationId(booking.getStation().getStationId());
                builder.stationName(booking.getStation().getStationName());
            } catch (Exception e) {
                log.debug("Unable to read station fields: {}", e.getMessage());
            }
        }

        // vehicleDetail
        VehicleDetail vd = booking.getVehicleDetail();
        if (vd != null) {
            builder.vehicleDetailId(vd.getId());
            builder.licensePlate(vd.getLicensePlate());
            // station of vehicleDetail could also be used:
            try {
                if (vd.getStation() != null) {
                    // builder.stationId(vd.getStation().getStationId());
                    builder.stationName(vd.getStation().getStationName());
                }
            } catch (Exception e) {
                log.debug("VehicleDetail.station read failed: {}", e.getMessage());
            }
        }

        // vehicleModel (from Booking.vehicleModel or vd.vehicleModel)
        VehicleModel vm = booking.getVehicleModel();
        if (vm != null) {
            builder.vehicleModelId(vm.getVehicleId());
            builder.vehicleBrand(vm.getBrand());
            builder.vehicleModel(vm.getModel());
        } else if (vd != null && vd.getVehicleModel() != null) {
            VehicleModel vm2 = vd.getVehicleModel();
            builder.vehicleModelId(vm2.getVehicleId());
            builder.vehicleBrand(vm2.getBrand());
            builder.vehicleModel(vm2.getModel());
        }

        // payment total: find Payment by Booking entity
        try {
            Optional<Payment> pOpt = paymentRepository.findByBooking(booking);
            if (pOpt.isPresent()) {
                builder.paymentTotal(pOpt.get().getTotal());
            } else {
                builder.paymentTotal(null);
            }
        } catch (Exception ex) {
            log.warn("Error fetching payment for booking {}: {}", booking.getBookingId(), ex.getMessage());
            builder.paymentTotal(null);
        }

        return builder.build();
    }

    //End code here
}

package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.*;
import com.evrental.evrentalsystem.enums.*;
import com.evrental.evrentalsystem.repository.*;
import com.evrental.evrentalsystem.request.BookingUpdateRequest;
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
    private final VehicleModelRepository vehicleModelRepository;
    private final InspectionRepository inspectionRepository;

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
        if (request.getStatus() != null)
            user.setStatus(StaffStatusEnum.valueOf(request.getStatus().toString().trim().toUpperCase()));

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

    @Transactional // 2. Thêm Transactional để đảm bảo cả 2 bảng được update cùng lúc hoặc rollback nếu lỗi
    public String updateReportStatus(UpdateReportStatusRequest request) {
        if (request.getReportId() == null || request.getStatus() == null || request.getStatus().isBlank()) {
            return "Invalid request data";
        }

        return reportRepository.findById(request.getReportId())
                .map(report -> {
                    try {
                        // Convert string request sang Enum
                        ReportStatusEnum newStatus = ReportStatusEnum.valueOf(request.getStatus());
                        report.setStatus(newStatus);
                        if (newStatus.equals(ReportStatusEnum.RESOLVED) || newStatus.equals(ReportStatusEnum.REJECTED)) {
                            VehicleDetail vehicle = report.getVehicleDetail();
                            if (vehicle != null) {
                                vehicle.setStatus(VehicleStatus.AVAILABLE);
                                vehicleDetailRepository.save(vehicle); // Lưu thay đổi của xe
                            }
                        } else {
                            VehicleDetail vehicle = report.getVehicleDetail();
                            if (vehicle != null) {
                                vehicle.setStatus(VehicleStatus.FIXING);
                                vehicleDetailRepository.save(vehicle); // Lưu thay đổi của xe
                            }
                        }
                        reportRepository.save(report); // Lưu thay đổi của report
                        return "Update report status success";

                    } catch (IllegalArgumentException e) {
                        return "Invalid status value provided";
                    }
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

    @Transactional
    public Booking updateRenterBooking(BookingUpdateRequest request) {
        // 1. Tìm Booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + request.getBookingId()));

        BookingStatus currentStatus = booking.getStatus();

        // =================================================================================
        // TRẠNG THÁI "PENDING_DEPOSIT_PAYMENT" (Chưa cọc)
        // -> Được phép đổi Model (Giá tiền thay đổi).
        // -> KHÔNG ĐƯỢC ĐỔI TRẠM.
        // =================================================================================
        if (currentStatus == BookingStatus.Pending_Deposit_Payment) {

            // Cập nhật Model xe (Nếu có thay đổi)
            if (request.getVehicleModelId() != null && !request.getVehicleModelId().equals(booking.getVehicleModel().getVehicleId())) {
                VehicleModel model = vehicleModelRepository.findById(request.getVehicleModelId())
                        .orElseThrow(() -> new RuntimeException("Model xe không tồn tại"));

                booking.setVehicleModel(model);

                // TODO: Logic tính lại tiền cọc (Deposit) dựa trên Model mới nên được đặt ở đây
                // booking.setDeposit(model.getPrice() * days * 0.3);
            }
        }

        // =================================================================================
        // TỪ "PENDING_CONFIRMATION" ĐẾN "INSPECTED_BEFORE_PICKUP"
        // -> Đã cọc rồi -> KHÔNG được đổi Model (vì lệch giá).
        // -> Được chọn lại Detail (Biển số) -> Reset Inspection -> Reset về Pending_Vehicle_Pickup.
        // =================================================================================
        else if (isPrePickupStatus(currentStatus)) {

            // Chặn đổi Model ở giai đoạn này (vì tiền cọc đã chốt)
            if (request.getVehicleModelId() != null && !request.getVehicleModelId().equals(booking.getVehicleModel().getVehicleId())) {
                throw new RuntimeException("Không thể đổi dòng xe (Model) khi đã đặt cọc xong. Vui lòng hủy đơn và đặt lại.");
            }

            // Logic Đổi/Gán chi tiết xe (Vehicle Detail)
            if (request.getVehicleDetailId() != null) {
                // Kiểm tra xem có thay đổi xe so với hiện tại không
                boolean isVehicleChanged = booking.getVehicleDetail() == null ||
                        !request.getVehicleDetailId().equals(booking.getVehicleDetail().getId());

                if (isVehicleChanged) {
                    VehicleDetail newVehicle = vehicleDetailRepository.findById(request.getVehicleDetailId())
                            .orElseThrow(() -> new RuntimeException("Xe không tồn tại"));

                    // Validate: Xe mới phải cùng Model với đơn hàng
                    if (!newVehicle.getVehicleModel().getVehicleId().equals(booking.getVehicleModel().getVehicleId())) {
                        throw new RuntimeException("Xe được chọn không đúng loại Model đã đặt (Khác giá tiền)");
                    }

                    // Validate: Xe mới phải Available (trừ khi gán lại chính nó để reset quy trình)
                    if (newVehicle.getStatus() != VehicleStatus.AVAILABLE) {
                        throw new RuntimeException("Xe này đang bận, vui lòng chọn xe khác");
                    }

                    // 1. Nhả xe cũ (nếu có)
                    if (booking.getVehicleDetail() != null) {
                        VehicleDetail oldVehicle = booking.getVehicleDetail();
                        oldVehicle.setStatus(VehicleStatus.AVAILABLE);
                        vehicleDetailRepository.save(oldVehicle);
                    }

                    // 2. Xóa Inspection cũ (Theo yêu cầu: Reset quy trình kiểm tra)
                    inspectionRepository.deleteByBooking_BookingId(booking.getBookingId());

                    // 3. Gán xe mới & Cập nhật trạng thái xe
                    booking.setVehicleDetail(newVehicle);
                    newVehicle.setStatus(VehicleStatus.RENTED);
                    vehicleDetailRepository.save(newVehicle);

                    // 4. Đặt lại trạng thái Booking về Pending_Vehicle_Pickup
                    // Để nhân viên bắt buộc phải đi kiểm tra xe mới này
                    booking.setStatus(BookingStatus.Pending_Vehicle_Pickup);
                }
            }
        }

        // =================================================================================
        // TỪ "CURRENTLY_RENTING" TRỞ ĐI (Bị khóa xe)
        // -> Không được đổi xe hay model nữa.
        // =================================================================================
        else if (isLockedStatus(currentStatus)) {
            if (request.getVehicleDetailId() != null && !request.getVehicleDetailId().equals(booking.getVehicleDetail().getId())) {
                throw new RuntimeException("Xe đang trong quá trình thuê. Không thể thay đổi xe!");
            }
            if (request.getVehicleModelId() != null && !request.getVehicleModelId().equals(booking.getVehicleModel().getVehicleId())) {
                throw new RuntimeException("Không thể đổi Model xe ở giai đoạn này!");
            }
        }

        // =================================================================================
        // CẬP NHẬT CÁC THÔNG TIN CHUNG
        // =================================================================================

        if (request.getStartTime() != null) booking.setStartTime(request.getStartTime());
        if (request.getExpectedReturnTime() != null) booking.setExpectedReturnTime(request.getExpectedReturnTime());
        if (request.getActualReturnTime() != null) booking.setActualReturnTime(request.getActualReturnTime());

        // Cập nhật trạng thái thủ công (Nếu request có gửi status)
        // LƯU Ý: Nếu logic ở Nhóm 2 đã reset status về Pending_Vehicle_Pickup thì sẽ ưu tiên logic đó.
        // Chỉ cập nhật status từ request nếu KHÔNG xảy ra việc đổi xe ở Nhóm 2.
        if (request.getStatus() != null) {
            boolean justResetStatus = isPrePickupStatus(currentStatus) &&
                    request.getVehicleDetailId() != null &&
                    (booking.getVehicleDetail() == null || !request.getVehicleDetailId().equals(booking.getVehicleDetail().getId()));

            if (!justResetStatus) {
                booking.setStatus(request.getStatus());
            }
        }

        return bookingRepository.save(booking);
    }

    // --- Helper Methods ---

    private boolean isPrePickupStatus(BookingStatus status) {
        return status == BookingStatus.Pending_Deposit_Confirmation ||
                status == BookingStatus.Pending_Contract_Signing ||
                status == BookingStatus.Pending_Vehicle_Pickup ||
                status == BookingStatus.Vehicle_Inspected_Before_Pickup;
    }

    private boolean isLockedStatus(BookingStatus status) {
        return status == BookingStatus.Currently_Renting ||
                status == BookingStatus.Vehicle_Returned ||
                status == BookingStatus.Vehicle_Inspected_After_Pickup ||
                status == BookingStatus.Pending_Total_Payment ||
                status == BookingStatus.Pending_Total_Payment_Confirmation ||
                status == BookingStatus.Completed ||
                status == BookingStatus.Cancelled;
    }
    //End code here
}

package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Inspection;
import com.evrental.evrentalsystem.entity.User;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.repository.InspectionRepository;
import com.evrental.evrentalsystem.repository.UserRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.response.staff.BookingsInStationResponse;
import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.repository.BookingRepository;
import com.evrental.evrentalsystem.response.staff.VehicleDetailsResponse;
import com.evrental.evrentalsystem.response.staff.VehicleIdAndLicensePlateResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffService {

    private final BookingRepository bookingRepository;
    private final VehicleDetailRepository vehicleDetailRepository;
    private final UserRepository userRepository;
    private final InspectionRepository inspectionRepository;

    private String encodeToBase64(MultipartFile file) {
        try {
            if (file != null && !file.isEmpty()) {
                byte[] bytes = file.getBytes();
                log.info("Encode file {} size {}", file.getOriginalFilename(), bytes.length);
                return Base64.getEncoder().encodeToString(bytes);
            } else {
                throw new RuntimeException("File upload bị trống!");
            }
        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc file: " + file.getOriginalFilename(), e);
        }
    }

    public List<BookingsInStationResponse> bookingsInStation(Integer stationId) {
        // Tìm danh sách booking theo stationId
        List<Booking> bookings = bookingRepository.findByStation_StationId(stationId);

        // Chuyển đổi List<Booking> thành List<BookingsInStationResponse>
        return bookings.stream()
                .map(booking -> {
                    // Tạo đối tượng BookingsInStationResponse từ đối tượng Booking
                    BookingsInStationResponse response = new BookingsInStationResponse();

                    // Gán các giá trị cho response từ booking
                    response.id = booking.getBookingId();
                    response.customerName = booking.getRenter() != null ? booking.getRenter().getFullName() : "Unknown";
                    response.customerNumber = booking.getRenter() != null ? booking.getRenter().getPhone() : "Unknown"; // Giả sử có trường phoneNumber trong User
                    response.vehicleModelId = booking.getVehicleModel().getVehicleId();
                    response.vehicleModel = booking.getVehicleModel() != null ? booking.getVehicleModel().getModel() : "Unknown"; // Giả sử có trường modelName trong VehicleModel
                    response.startDate = booking.getStartTime();
                    response.endDate = booking.getExpectedReturnTime();
                    response.totalAmount = booking.getTotalAmount();
                    response.status = booking.getStatus();
                    return response;
                })
                .collect(Collectors.toList()); // Thu thập các đối tượng vào danh sách
    }

    public boolean changeStatus(int id, String status) {
        try {
            int updated = bookingRepository.updateBookingStatus(id, status);
            if (updated > 0) {
                log.info("✅ Update success! (Booking ID: {})", id);
                return true;
            } else {
                log.warn("⚠️ No booking found with ID: {}", id);
                return false;
            }
        } catch (Exception e) {
            log.error("❌ Error updating booking status for ID: {}", id, e);
            throw e; // ném lỗi lên controller
        }
    }

    public List<VehicleIdAndLicensePlateResponse> getAllAvailableVehiclesInStationAndModel(int modelId, int stationId){
        List<VehicleDetail> vehicles = vehicleDetailRepository.findAllByVehicleModel_VehicleIdAndStation_StationIdAndStatus(modelId,stationId,"AVAILABLE");
        return vehicles.stream()
                .map(vehicle -> new VehicleIdAndLicensePlateResponse(
                        vehicle.getId(),
                        vehicle.getLicensePlate()
                ))
                .collect(Collectors.toList());
    }



    public VehicleDetailsResponse getVehicleDetailById(int id) {
        VehicleDetailsResponse response = new VehicleDetailsResponse();
        VehicleDetail vehicleDetail = vehicleDetailRepository.findById(id).orElse(null);
        if(vehicleDetail != null) {
            response.setId(vehicleDetail.getId());
            response.setModelName(vehicleDetail.getVehicleModel().getModel());
            response.setLicensePlate(vehicleDetail.getLicensePlate());
            response.setColor(vehicleDetail.getColor());
            response.setBattery(vehicleDetail.getBatteryCapacity());
            response.setOdo(vehicleDetail.getOdo());
            response.setImage(vehicleDetail.getPicture());
        }
        return response;
    }

    public boolean changeVehicleStatus(Integer vehicleId, String newStatus) {
        int updated = vehicleDetailRepository.updateVehicleStatusById(vehicleId, newStatus);
        return updated > 0;
    }


    public boolean createInspection(
            Integer bookingId,
            String partName,
            MultipartFile picture,
            Integer staffId,
            String status
    ) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Booking ID không tồn tại: " + bookingId));

            User staff = userRepository.findById(staffId)
                    .orElseThrow(() -> new IllegalArgumentException("Staff ID không tồn tại: " + staffId));

            Inspection inspection = new Inspection();
            inspection.setBooking(booking);
            inspection.setPartName(partName);

            String base64Picture = encodeToBase64(picture);
            log.info("Base64 picture length: {}", base64Picture.length());
            inspection.setPicture(base64Picture);

            inspection.setStaff(staff);
            inspection.setStatus(status);
            inspection.setInspectedAt(LocalDateTime.now());

            inspectionRepository.save(inspection);

            return true; // ✅ Thành công
        } catch (Exception e) {
            // Có thể log lỗi ra console hoặc logger ở đây
            return false; // ❌ Thất bại
        }
    }

}

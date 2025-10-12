package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.VehicleDetail;
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
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffService {

    private final BookingRepository bookingRepository;
    private final VehicleDetailRepository vehicleDetailRepository;

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
        }
        return response;
    }

}

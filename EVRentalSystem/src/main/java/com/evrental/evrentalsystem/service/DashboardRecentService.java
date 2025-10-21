package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Payment;
import com.evrental.evrentalsystem.repository.BookingRepository;
import com.evrental.evrentalsystem.repository.PaymentRepository;
import com.evrental.evrentalsystem.response.admin.RecentRentalsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

import static com.evrental.evrentalsystem.service.DashboardTime.*;

@Service
@RequiredArgsConstructor
public class DashboardRecentService {
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public RecentRentalsResponse recent(int limit) {
        int top = Math.max(1, limit);
        var bookings = bookingRepository.findTopNByOrderByCreatedAtDesc(top);

        var rows = bookings.stream().map(b -> {
            // Giá thanh toán (nếu có)
            Long price = paymentRepository.findByBooking_BookingId(b.getBookingId())
                    .stream()
                    .findFirst()
                    .map(Payment::getTotal)
                    .map(Number::longValue)
                    .orElse(null);

            // Tên khách
            String customerName = (b.getRenter() != null && b.getRenter().getFullName() != null)
                    ? b.getRenter().getFullName()
                    : "";

            // Mã xe / biển số: lấy từ VehicleDetail
            String vehicleCode = (b.getVehicleDetail() != null && b.getVehicleDetail().getLicensePlate() != null)
                    ? b.getVehicleDetail().getLicensePlate()
                    : "";

            // Thời gian: LocalDateTime -> chuỗi ISO đơn giản
            String startTime = b.getStartTime() != null ? b.getStartTime().toString() : null;
            String endTime   = b.getActualReturnTime() != null ? b.getActualReturnTime().toString() : null;

            return RecentRentalsResponse.RentalRow.builder()
                    .rentalId(b.getBookingId().longValue())
                    .customerName(customerName)
                    .vehicleCode(vehicleCode)
                    .startTime(startTime)
                    .endTime(endTime)
                    .status(b.getStatus() != null ? b.getStatus() : "")
                    .price(price)
                    .build();
        }).toList();

        return new RecentRentalsResponse(rows);
    }
}


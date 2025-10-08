package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.request.BookingRequest;
import com.evrental.evrentalsystem.entity.User;
import com.evrental.evrentalsystem.repository.BookingRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleDetailRepository vehicleDetailRepository;

    @Autowired
    private UserRepository userRepository;

    // Tạo booking mới
    public Booking createBooking(User user, BookingRequest request) {
        // Kiểm tra xem thời gian bắt đầu có hợp lệ không (startTime < expectedReturnTime)
        if (request.getStartTime().isAfter(request.getExpectedReturnTime())) {
            throw new IllegalArgumentException("Start time cannot be after expected return time");
        }

        // Lấy thông tin xe từ biển số xe
        var vehicleDetail = vehicleDetailRepository.findByLicensePlate(request.getLicensePlate());
        if (vehicleDetail == null) {
            throw new IllegalArgumentException("Vehicle not found");
        }

        // Khởi tạo booking
        Booking booking = new Booking();
        booking.setRenter(user);  // Người thuê
        booking.setVehicleDetail(vehicleDetail);  // Chi tiết xe
        booking.setStartTime(request.getStartTime());
        booking.setExpectedReturnTime(request.getExpectedReturnTime());
        booking.setDeposit(request.getDeposit());
        booking.setStatus("WAITING_FOR_OTP");  // Trạng thái ban đầu
        booking.setCreatedAt(LocalDateTime.now());

        // Tính toán tiền thuê
        booking.calculateRentalAmount();

        // Lưu vào database
        return bookingRepository.save(booking);
    }

    // Cập nhật trạng thái booking sau khi xác thực OTP
    public void updateBookingStatusAfterOtp(Booking booking) {
        // Kiểm tra trạng thái trước khi cập nhật
        if ("PENDING".equals(booking.getStatus())) {
            return; // Không cần cập nhật nếu trạng thái đã là PENDING
        }

        booking.setStatus("PENDING");
        bookingRepository.save(booking);
    }

    // Tìm booking theo email của người dùng
    public Booking findBookingByUserEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = userOptional.get();

        // Tìm booking của người dùng theo userId
        return bookingRepository.findByRenter_UserId(user.getUserId()).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
    }

    // Tìm tất cả các booking theo trạng thái
    public List<Booking> findBookingsByStatus(String status) {
        return bookingRepository.findByStatus(status);  // Tìm tất cả các booking theo trạng thái
    }
}


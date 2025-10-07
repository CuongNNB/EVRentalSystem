package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Booking")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookingId;

    // Liên kết với bảng User qua cột renter_id
    @ManyToOne
    @JoinColumn(name = "renter_id", referencedColumnName = "userId", nullable = false)
    private User renter;  // Thông tin người thuê

    // Liên kết với bảng VehicleDetail qua cột license_plate
    @ManyToOne
    @JoinColumn(name = "license_plate", referencedColumnName = "licensePlate", nullable = false)
    private VehicleDetail vehicleDetail;  // Chi tiết xe

    // Liên kết với bảng Promotion qua cột promotion_id
    @ManyToOne
    @JoinColumn(name = "promotion_id", referencedColumnName = "promotionId")
    private Promotion promotion;  // Khuyến mãi (nếu có)

    // Liên kết với bảng VehicleModel qua cột vehicle_model_id
    @ManyToOne
    @JoinColumn(name = "vehicle_model_id", referencedColumnName = "vehicleId", nullable = false)
    private VehicleModel vehicleModel;  // Mẫu xe

    // Liên kết với bảng Station qua cột station_id
    @ManyToOne
    @JoinColumn(name = "station_id", referencedColumnName = "stationId", nullable = false)
    private Station station;  // Trạm

    private LocalDateTime createdAt = LocalDateTime.now();  // Thời gian tạo đơn

    private LocalDateTime startTime;  // Thời gian bắt đầu thuê
    private LocalDateTime expectedReturnTime;  // Thời gian trả xe dự kiến
    private LocalDateTime actualReturnTime;  // Thời gian trả xe thực tế

    private Double deposit;  // Tiền cọc

    private String status;  // Trạng thái giao dịch (WAITING_FOR_OTP, PENDING, COMPLETED, CANCELLED)

    private Double rentalAmount;  // Tiền thuê xe (tính theo ngày)
    private Double additionalFees = 0.0;  // Các phụ phí (phạt, vệ sinh, etc.), tạm thời = 0
    private Double totalAmount;  // Tổng tiền (tiền thuê xe + phụ phí)

    // Tính tiền thuê xe theo ngày
    public void calculateRentalAmount() {
        if (startTime != null && expectedReturnTime != null) {
            long days = ChronoUnit.DAYS.between(startTime, expectedReturnTime);
            double dailyRate = vehicleDetail.getRentalPricePerDay();  // Giá thuê xe mỗi ngày
            this.rentalAmount = dailyRate * days;
        }
    }

    // Tính tổng số tiền (tiền thuê + phụ phí) sau khi trả xe
    public void calculateTotalAmount() {
        this.totalAmount = this.rentalAmount + (this.additionalFees != null ? this.additionalFees : 0);
    }
}

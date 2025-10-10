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

    @ManyToOne
    @JoinColumn(name = "renter_id", referencedColumnName = "userId", nullable = false)
    private User renter;

    @ManyToOne
    @JoinColumn(name = "license_plate", referencedColumnName = "licensePlate", nullable = false)
    private VehicleDetail vehicleDetail;

    @ManyToOne
    @JoinColumn(name = "promotion_id", referencedColumnName = "promotionId")
    private Promotion promotion;

    @ManyToOne
    @JoinColumn(name="vehicle_model_id", nullable=false)
    private VehicleModel vehicleModel;

    @ManyToOne
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime startTime;
    private LocalDateTime expectedReturnTime;
    private LocalDateTime actualReturnTime;

    private Double deposit;

    // Trạng thái lưu dưới dạng String thay vì Enum
    private String status;

    @Transient
    private Double rentalAmount;
    @Transient
    private Double additionalFees = 0.0;
    @Transient
    private Double totalAmount;

    // Tính tiền thuê xe theo ngày
    public void calculateRentalAmount() {
        if (startTime != null && expectedReturnTime != null) {
            long days = ChronoUnit.DAYS.between(startTime, expectedReturnTime);
            double dailyRate = vehicleDetail.getRentalPricePerDay();
            this.rentalAmount = dailyRate * days;
        } else {
            // Xử lý trường hợp không có thời gian bắt đầu hoặc trả xe hợp lệ
            this.rentalAmount = 0.0;
        }
    }

    // Tính tổng số tiền (tiền thuê + phụ phí)
    public void calculateTotalAmount() {
        if (this.rentalAmount == null) {
            calculateRentalAmount();  // Đảm bảo rằng tiền thuê đã được tính trước khi tính tổng
        }
        this.totalAmount = this.rentalAmount + (this.additionalFees != null ? this.additionalFees : 0);
    }

    @PrePersist
    public void prePersist() {
        calculateRentalAmount();
        calculateTotalAmount();
    }

    @PostLoad
    public void postLoad() {
        calculateRentalAmount();
        calculateTotalAmount();
    }
}

package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id", nullable = false)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "renter_id", nullable = false)
    User renter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    User staff;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "license_plate", nullable = false)
    VehicleDetail licensePlate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    Promotion promotion;

    @ColumnDefault("sysutcdatetime()")
    @Column(name = "created_at", nullable = false)
    Instant createdAt = Instant.now();

    @Column(name = "start_time", nullable = false)
    Instant startTime;

    @Column(name = "expected_return_time", nullable = false)
    Instant expectedReturnTime;

    @Column(name = "actual_return_time")
    Instant actualReturnTime;

    @Column(name = "deposit", nullable = false, precision = 10, scale = 2)
    BigDecimal deposit = BigDecimal.ZERO;

    @Nationalized
    @ColumnDefault("N'PENDING'")
    @Column(name = "status", nullable = false, length = 20)
    String status = "PENDING";

    @Nationalized
    @Column(name = "otp_code", length = 10)
    String otpCode;

    @Column(name = "otp_expires_at")
    Instant otpExpiresAt;

    @ColumnDefault("0")
    @Column(name = "otp_verified", nullable = false)
    Boolean otpVerified = false;

    @ColumnDefault("0")
    @Column(name = "otp_attempts", nullable = false)
    Integer otpAttempts = 0;
}
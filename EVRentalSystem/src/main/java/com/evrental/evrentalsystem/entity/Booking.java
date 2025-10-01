package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "renter_id", nullable = false)
    private User renter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "license_plate", nullable = false)
    private VehicleDetail licensePlate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @ColumnDefault("sysutcdatetime()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "expected_return_time", nullable = false)
    private Instant expectedReturnTime;

    @Column(name = "actual_return_time")
    private Instant actualReturnTime;

    @Column(name = "deposit", nullable = false, precision = 10, scale = 2)
    private BigDecimal deposit;

    @Nationalized
    @ColumnDefault("N'PENDING'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Nationalized
    @Column(name = "otp_code", length = 10)
    private String otpCode;

    @Column(name = "otp_expires_at")
    private Instant otpExpiresAt;

    @ColumnDefault("0")
    @Column(name = "otp_verified", nullable = false)
    private Boolean otpVerified = false;

    @ColumnDefault("0")
    @Column(name = "otp_attempts", nullable = false)
    private Integer otpAttempts;

}
package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
    @JoinColumn(name = "renter_id", nullable = false)
    private User renter;

    @ManyToOne
    @JoinColumn(name = "license_plate", referencedColumnName = "licensePlate")
    private VehicleDetail vehicleDetail;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime startTime;
    private LocalDateTime expectedReturnTime;
    private LocalDateTime actualReturnTime;
    private Double deposit;
    private String status;
}

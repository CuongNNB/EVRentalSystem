package com.evrental.evrentalsystem.entity;

import com.evrental.evrentalsystem.enums.BookingStatus;
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
    @JoinColumn(name = "license_plate", referencedColumnName = "licensePlate", nullable = true)
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

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

}

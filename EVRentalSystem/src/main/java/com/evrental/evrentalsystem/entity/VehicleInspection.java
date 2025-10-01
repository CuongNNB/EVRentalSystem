package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "Vehicle_Inspection")
public class VehicleInspection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inspection_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Nationalized
    @Column(name = "part_name", nullable = false, length = 100)
    private String partName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;

    @ColumnDefault("sysutcdatetime()")
    @Column(name = "inspected_at", nullable = false)
    private Instant inspectedAt;

    @Nationalized
    @Column(name = "status", nullable = false, length = 20)
    private String status;

}
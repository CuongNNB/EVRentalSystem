package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "Vehicle_Detail")
public class VehicleDetail {
    @Id
    @Nationalized
    @Column(name = "license_plate", nullable = false, length = 50)
    private String licensePlate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Nationalized
    @Column(name = "color", length = 50)
    private String color;

    @Nationalized
    @Column(name = "battery_capacity", length = 50)
    private String batteryCapacity;

    @Column(name = "odo")
    private Integer odo;

}
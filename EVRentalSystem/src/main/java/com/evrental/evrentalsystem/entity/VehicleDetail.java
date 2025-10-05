package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Vehicle_Detail")
public class VehicleDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String licensePlate;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private VehicleModel vehicleModel;

    @ManyToOne
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    private String color;
    private String batteryCapacity;
    private Integer odo;
}

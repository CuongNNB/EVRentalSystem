package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Vehicle_Model")
public class VehicleModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer vehicleId;

    private String brand;
    private String model;
    private Double price;
    private Integer seats;
    private String status;
}

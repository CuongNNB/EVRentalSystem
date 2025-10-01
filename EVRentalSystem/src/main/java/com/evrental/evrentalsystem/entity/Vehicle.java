package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "brand", nullable = false, length = 100)
    private String brand;

    @Nationalized
    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "seats", nullable = false)
    private Integer seats;

    @Nationalized
    @ColumnDefault("N'AVAILABLE'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

}
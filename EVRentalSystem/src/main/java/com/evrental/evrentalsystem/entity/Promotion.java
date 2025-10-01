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
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "promo_name", nullable = false, length = 100)
    private String promoName;

    @Nationalized
    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "discount_percent")
    private Double discountPercent;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Nationalized
    @ColumnDefault("N'ACTIVE'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

}
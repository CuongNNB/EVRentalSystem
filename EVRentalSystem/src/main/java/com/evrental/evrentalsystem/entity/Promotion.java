package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Promotion")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer promotionId;

    private String promoName;

    @Lob
    private String code;

    private Double discountPercent;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
}

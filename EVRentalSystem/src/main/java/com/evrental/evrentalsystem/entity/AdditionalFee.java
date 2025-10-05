package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Additional_Fee")
public class AdditionalFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer feeId;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    private String feeName;
    private Double amount;

    @Lob
    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();
}

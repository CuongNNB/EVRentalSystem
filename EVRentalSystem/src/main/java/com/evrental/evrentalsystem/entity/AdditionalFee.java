package com.evrental.evrentalsystem.entity;

import com.evrental.evrentalsystem.enums.AdditionalFeeEnum;
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

    @Enumerated(EnumType.STRING)
    private AdditionalFeeEnum feeName;
    private Double amount;

    @Lob
    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();
}

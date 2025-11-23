package com.evrental.evrentalsystem.entity;

import com.evrental.evrentalsystem.enums.ContractStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Contract")
public class Contract {
//    Staff manage contract
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staffManager;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer contractId;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    private LocalDateTime signedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private ContractStatusEnum status;
    private String otpCode;
}

package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Inspection")
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer inspectionId;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    private String partName;

    @Lob
    private String picture;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;

    private LocalDateTime inspectedAt = LocalDateTime.now();
    private String status;
}

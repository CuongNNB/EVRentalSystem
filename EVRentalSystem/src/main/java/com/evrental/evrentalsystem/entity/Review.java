package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Review")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reviewId;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    private Integer rating;

    @Lob
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}

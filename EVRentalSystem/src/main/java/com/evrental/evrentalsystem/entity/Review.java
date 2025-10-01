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
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id", nullable = false)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "renter_id", nullable = false)
    private User renter;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Nationalized
    @Lob
    @Column(name = "comment")
    private String comment;

    @ColumnDefault("sysutcdatetime()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

}
package com.evrental.evrentalsystem.entity;

import com.evrental.evrentalsystem.enums.InspectionStatusEnum;
import com.evrental.evrentalsystem.enums.PartCarName;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Inspection_After")
public class InspectionAfter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer inspectionId;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    private PartCarName partName;

    @Lob
    @Column(name = "picture", columnDefinition = "nvarchar(MAX)", nullable = true)
    private String picture;

    @Lob
    @Column(name = "description", columnDefinition = "nvarchar(MAX)", nullable = true)
    private String description;


    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;

    private LocalDateTime inspectedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private InspectionStatusEnum status;
}

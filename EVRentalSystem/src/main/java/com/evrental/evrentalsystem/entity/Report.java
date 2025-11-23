package com.evrental.evrentalsystem.entity;

import com.evrental.evrentalsystem.enums.ReportStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Report")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reportId;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private User admin;

    @ManyToOne
    @JoinColumn(name = "vehicle_detail_id", nullable = false)
    private VehicleDetail vehicleDetail;

    @Lob
    private String description;
    @Enumerated(EnumType.STRING)
    private ReportStatusEnum status;
    private LocalDateTime createdAt = LocalDateTime.now();
}

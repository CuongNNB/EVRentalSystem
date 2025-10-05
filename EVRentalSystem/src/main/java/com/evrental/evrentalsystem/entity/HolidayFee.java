package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Holiday_Fee")
public class HolidayFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer holidayId;

    private String feeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double value;
    private String status;

    private LocalDateTime createdAt = LocalDateTime.now();
}

package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Employee_Detail")
public class EmployeeDetail {

    @Id
    private Integer employeeId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "employee_id")
    private User employee;

    @ManyToOne
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;
}

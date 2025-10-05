package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Station")
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer stationId;

    private String stationName;
    private String address;
    private String location;
}

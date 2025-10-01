package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
public class Station {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "station_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Nationalized
    @Column(name = "station_name", nullable = false)
    private String stationName;

    @Nationalized
    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Nationalized
    @Column(name = "location")
    private String location;

}
package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "Vehicle_Inventory")
public class VehicleInventory {
    @EmbeddedId
    private VehicleInventoryId id;

    @MapsId("stationId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @MapsId("vehicleId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

}
package com.evrental.evrentalsystem.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class VehicleInventoryId implements Serializable {
    private static final long serialVersionUID = -8766021707724479511L;
    @Column(name = "station_id", nullable = false)
    private Integer stationId;

    @Column(name = "vehicle_id", nullable = false)
    private Integer vehicleId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        VehicleInventoryId entity = (VehicleInventoryId) o;
        return Objects.equals(this.vehicleId, entity.vehicleId) &&
                Objects.equals(this.stationId, entity.stationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(vehicleId, stationId);
    }

}
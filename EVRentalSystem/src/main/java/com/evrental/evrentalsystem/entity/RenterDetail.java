package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "Renter_Detail")
public class RenterDetail {
    @Id
    @Column(name = "renter_id", nullable = false)
    private Integer id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "renter_id", nullable = false)
    private User user;

    @Nationalized
    @Lob
    @Column(name = "cccd_front")
    private String cccdFront;

    @Nationalized
    @Lob
    @Column(name = "cccd_back")
    private String cccdBack;

    @Nationalized
    @Column(name = "driver_license", length = 50)
    private String driverLicense;

    @Nationalized
    @ColumnDefault("N'PENDING'")
    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus;

    @ColumnDefault("0")
    @Column(name = "is_risky", nullable = false)
    private Boolean isRisky = false;

}
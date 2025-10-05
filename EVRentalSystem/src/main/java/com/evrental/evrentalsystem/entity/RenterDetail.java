package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Renter_Detail")
public class RenterDetail {

    @Id
    private Integer renterId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "renter_id")
    private User renter;

    @Lob
    private String cccdFront;

    @Lob
    private String cccdBack;

    private String driverLicense;
    private String verificationStatus;
    private boolean isRisky = false;
}

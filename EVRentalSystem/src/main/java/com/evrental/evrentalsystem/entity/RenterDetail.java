package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Renter_Detail")
@Data
@NoArgsConstructor
public class RenterDetail {

    @Id
    @Column(name = "renter_id")
    private Integer renterId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId  // Dùng cùng ID với User
    @JoinColumn(name = "renter_id", referencedColumnName = "user_id")
    private User renter;

    @Lob
    private String cccdFront;

    @Lob
    private String cccdBack;

    @Lob
    private String driverLicense;

    private String verificationStatus;
    private Boolean isRisky;
}

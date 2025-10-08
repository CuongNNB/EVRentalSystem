package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "renter_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RenterDetail {

    @Id
    @Column(name = "renter_id")
    private Integer renterId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "renter_id", referencedColumnName = "user_id")
    private User renter;

    @Lob
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String cccdFront;

    @Lob
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String cccdBack;

    @Lob
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String driverLicense;


    private String verificationStatus;
    private Boolean isRisky;
}


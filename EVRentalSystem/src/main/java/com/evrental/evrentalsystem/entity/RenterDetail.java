package com.evrental.evrentalsystem.entity;

import com.evrental.evrentalsystem.enums.RenterDetailVerificationStatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Renter_Detail")
@Data
@Builder
@AllArgsConstructor
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
    @Enumerated(EnumType.STRING)
    private RenterDetailVerificationStatusEnum verificationStatus;
    private Boolean isRisky;
}

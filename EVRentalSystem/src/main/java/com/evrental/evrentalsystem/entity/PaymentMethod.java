package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "Payment_Method")
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "method_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "method_name", nullable = false, length = 100)
    private String methodName;

    @Nationalized
    @Lob
    @Column(name = "description")
    private String description;

    @Nationalized
    @Lob
    @Column(name = "qr_image")
    private String qrImage;

    @Nationalized
    @ColumnDefault("N'ACTIVE'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

}
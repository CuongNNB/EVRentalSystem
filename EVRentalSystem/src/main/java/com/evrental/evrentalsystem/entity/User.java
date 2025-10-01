package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "\"User\"")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Nationalized
    @Column(name = "password", nullable = false)
    private String password;

    @Nationalized
    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Nationalized
    @Column(name = "email", length = 100)
    private String email;

    @Nationalized
    @Column(name = "address")
    private String address;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Nationalized
    @ColumnDefault("N'ACTIVE'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @ColumnDefault("sysutcdatetime()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

}
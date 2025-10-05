package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "[User]")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String fullName;
    private String phone;
    private String email;
    private String address;

    @Column(nullable = false)
    private String role; // ADMIN, STAFF, RENTER

    private String status;
    private LocalDateTime createdAt = LocalDateTime.now();
}

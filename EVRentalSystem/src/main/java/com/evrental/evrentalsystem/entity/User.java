package com.evrental.evrentalsystem.entity;

import com.evrental.evrentalsystem.enums.StaffStatusEnum;
import com.evrental.evrentalsystem.enums.UserEnum;
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
    @Enumerated(EnumType.STRING)
    private UserEnum role; // ADMIN, STAFF, RENTER
    @Enumerated(EnumType.STRING)
    private StaffStatusEnum status;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(mappedBy = "renter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RenterDetail renterDetail;

    @PrePersist
    @PreUpdate
    private void trimFields() {
        if (username != null) username = username.trim();
        if (password != null) password = password.trim();
        if (fullName != null) fullName = fullName.trim();
        if (phone != null) phone = phone.trim();
        if (email != null) {
            email = email.trim().toLowerCase();
        }
        if (address != null) address = address.trim();
        if (role != null) role = UserEnum.valueOf(role.toString().trim().toUpperCase()) ;
        if (status != null) status = StaffStatusEnum.valueOf(status.toString().trim().toUpperCase()) ;
    }
    // Kiểm tra role hợp lệ trong lớp User
    public void setRole(String role) {
        if (role != null) {
            role = role.trim().toUpperCase();
            if (!role.equals("ADMIN") && !role.equals("STAFF") && !role.equals("RENTER")) {
                throw new IllegalArgumentException("Invalid role: " + role);
            }
        }
        this.role = UserEnum.valueOf(role);
    }

}

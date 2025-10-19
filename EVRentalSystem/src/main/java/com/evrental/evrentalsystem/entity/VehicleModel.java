package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Vehicle_Model")
public class VehicleModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer vehicleId;  // Khóa chính của bảng Vehicle_Model

    private String brand;  // Thương hiệu xe
    private String model;  // Mẫu xe
    private Double price;  // Giá xe
    private Integer seats;  // Số ghế
    private String picture;

    @OneToMany(mappedBy = "vehicleModel")
    private List<VehicleDetail> vehicleDetails;  // Liên kết với VehicleDetail
}

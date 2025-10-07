package com.evrental.evrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Vehicle_Detail")
public class VehicleDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String licensePlate;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", referencedColumnName = "vehicle_id", nullable = false)
    private VehicleModel vehicleModel;

    @ManyToOne
    @JoinColumn(name = "station_id", referencedColumnName = "station_id", nullable = false)
    private Station station;

    private String color;
    private String batteryCapacity;
    private Integer odo;

    // Thêm phương thức này để lấy giá thuê xe mỗi ngày
    public double getRentalPricePerDay() {
        // Giả sử bạn lưu giá thuê xe trong bảng VehicleModel, và có phương thức để lấy giá mỗi ngày
        return vehicleModel.getPrice() / 30;  // Ví dụ: Giá thuê xe mỗi ngày là giá chia cho 30 ngày
    }
}

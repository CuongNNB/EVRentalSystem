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
    @JoinColumn(name = "vehicle_id", nullable = false)
    private VehicleModel vehicleModel;

    @ManyToOne
    @JoinColumn(name = "station_id", referencedColumnName = "station_id", nullable = false)
    private Station station;

    private String color;
    private String batteryCapacity;
    private String picture;
    private Integer odo;
    private String status;

    // Thêm phương thức này để lấy giá thuê xe mỗi ngày
    public double getRentalPricePerDay() {
        if (vehicleModel != null && vehicleModel.getPrice() != null) {
            return vehicleModel.getPrice() / 30;  // Hoặc theo cách tính khác
        }
        return 0.0;  // Trả về 0 nếu không có thông tin giá
    }
}

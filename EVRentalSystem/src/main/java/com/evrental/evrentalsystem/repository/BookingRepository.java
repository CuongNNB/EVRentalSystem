package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    // Tìm booking theo renterId (User's ID)
    List<Booking> findByRenter_UserId(Integer renterId);

    // Tìm booking theo stationId
    List<Booking> findByStation_StationId(Integer stationId);

    // Tìm booking theo trạng thái (dùng String status)
    List<Booking> findByStatus(String status);
}

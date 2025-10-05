package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByRenter_UserId(Integer renterId);
    List<Booking> findByStation_StationId(Integer stationId);
}

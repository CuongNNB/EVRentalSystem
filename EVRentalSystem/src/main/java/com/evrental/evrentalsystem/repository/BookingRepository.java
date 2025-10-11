package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Booking;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    // Tìm booking theo renterId (User's ID)
    List<Booking> findByRenter_UserId(Integer renterId);

    // Tìm booking theo stationId
    List<Booking> findByStation_StationId(Integer stationId);

    // Tìm booking theo trạng thái (dùng String status)
    List<Booking> findByStatus(String status);


    @Modifying
    @Transactional
    @Query("UPDATE Booking u SET u.status = :status WHERE u.bookingId = :id")
    int updateBookingStatus(@Param("id") int id, @Param("status") String status);
}

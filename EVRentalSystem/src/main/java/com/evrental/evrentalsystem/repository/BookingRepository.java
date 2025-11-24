package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.enums.BookingStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // Tìm booking theo renterId (User's ID)
    List<Booking> findByRenter_UserId(Integer renterId);

    // Tìm booking theo stationId
    List<Booking> findByStation_StationId(Integer stationId);

    // Tìm booking theo status
    List<Booking> findByStatus(String status);

    Optional<Booking> findByBookingId(Integer bookingId);

    @Modifying
    @Transactional
    @Query("UPDATE Booking u SET u.status = :status WHERE u.bookingId = :id")
    int updateBookingStatus(@Param("id") int id, @Param("status") BookingStatus status);

    // User bookings
    List<Booking> findAllByRenter_UserId(Integer userId);

    // KPI: đếm booking theo start_time trong khoảng
    int countByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    // Top stations: đếm booking của 1 station theo khoảng created_at
    @Query("""
        select count(b) from Booking b
        where b.station.stationId = :stationId
          and b.createdAt >= :start and b.createdAt < :end
    """)
    int countByStationIdAndCreatedAtBetween(@Param("stationId") Integer stationId,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);

    // Recent rentals / Activity
    @Query("select b from Booking b order by b.createdAt desc")
    List<Booking> findRecent(Pageable pageable);

    // Helper: lấy top N booking mới nhất
    default List<Booking> findTopNByOrderByCreatedAtDesc(int n) {
        return findRecent(PageRequest.of(0, n));
    }
}

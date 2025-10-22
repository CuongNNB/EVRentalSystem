package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Payment;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    List<Payment> findByBooking_BookingId(Integer bookingId);

    // Tổng doanh thu theo khoảng thời gian (Revenue)
    @Query("""
        select coalesce(sum(p.total), 0)
        from Payment p
        where p.paidAt >= :start and p.paidAt < :end
    """)
    Long sumTotalBetween(@Param("start") LocalDateTime start,
                         @Param("end") LocalDateTime end);

    // Tổng doanh thu theo station + thời gian (Top stations)
    @Query("""
        select coalesce(sum(p.total), 0)
        from Payment p
        join p.booking b
        where b.station.stationId = :stationId
          and p.paidAt >= :start and p.paidAt < :end
    """)
    Long sumTotalByStationBetween(@Param("stationId") Integer stationId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    @Query("select p from Payment p order by p.paidAt desc")
    List<Payment> findRecent(Pageable pageable);

    default List<Payment> findTopNByOrderByPaidAtDesc(int n) {
        return findRecent(PageRequest.of(0, n));
    }
}

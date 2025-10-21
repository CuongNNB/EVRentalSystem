package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.AdditionalFee;
import com.evrental.evrentalsystem.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AdditionalFeeRepository extends JpaRepository<AdditionalFee, Integer> {
    List<AdditionalFee> findByBooking_BookingId(Integer bookingId);
    List<AdditionalFee> findAllByBooking(Booking booking);

    @Query("select f from AdditionalFee f order by f.createdAt desc")
    List<AdditionalFee> findRecent(org.springframework.data.domain.Pageable pageable);

    default List<AdditionalFee> findTopNByOrderByCreatedAtDesc(int n) {
        return findRecent(org.springframework.data.domain.PageRequest.of(0, n));

    }
}

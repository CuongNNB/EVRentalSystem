package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.InspectionAfter;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InspectionAfterRepository extends JpaRepository<InspectionAfter, Integer> {
    List<InspectionAfter> findByBooking_BookingId(Integer bookingId);
    List<InspectionAfter> findAllByBooking(Booking booking);
    InspectionAfter findByBookingAndPartName(Booking booking, String partName );

    @Modifying
    @Transactional
    @Query("delete from InspectionAfter i where i.booking.bookingId = :bookingId and i.status = :status")
    int deleteByBookingIdAndStatus(Integer bookingId, String status);

    List<InspectionAfter> findByBookingBookingId(Integer bookingId);
}

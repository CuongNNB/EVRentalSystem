package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.Inspection;
import com.evrental.evrentalsystem.enums.InspectionStatusEnum;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InspectionRepository extends JpaRepository<Inspection, Integer> {
    List<Inspection> findByBooking_BookingId(Integer bookingId);
    List<Inspection> findAllByBooking(Booking booking);
    Inspection findByBookingAndPartName(Booking booking, String partName );

    @Modifying
    @Transactional
    @Query("delete from Inspection i where i.booking.bookingId = :bookingId and i.status = :status")
    int deleteByBookingIdAndStatus(Integer bookingId, InspectionStatusEnum status);

    void deleteByBooking_BookingId(Integer bookingId);
}

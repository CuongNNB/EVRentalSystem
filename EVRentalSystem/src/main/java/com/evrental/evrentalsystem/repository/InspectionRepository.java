package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionRepository extends JpaRepository<Inspection, Integer> {
    List<Inspection> findByBooking_BookingId(Integer bookingId);
    List<Inspection> findAllByBooking(Booking booking);
}

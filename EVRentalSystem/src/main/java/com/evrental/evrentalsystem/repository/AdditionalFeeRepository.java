package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.AdditionalFee;
import com.evrental.evrentalsystem.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdditionalFeeRepository extends JpaRepository<AdditionalFee, Integer> {
    List<AdditionalFee> findByBooking_BookingId(Integer bookingId);
    List<AdditionalFee> findAllByBooking(Booking booking);
}

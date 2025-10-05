package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByBooking_BookingId(Integer bookingId);
}

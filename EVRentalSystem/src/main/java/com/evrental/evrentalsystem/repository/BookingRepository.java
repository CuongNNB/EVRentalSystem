package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
}

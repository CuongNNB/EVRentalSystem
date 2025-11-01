package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Optional<Review> findByBooking_BookingId(Integer bookingId);
    boolean existsByBooking_BookingId(Integer bookingId);
}

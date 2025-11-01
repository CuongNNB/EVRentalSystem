package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Optional<Review> findByBooking_BookingId(Integer bookingId);
    boolean existsByBooking_BookingId(Integer bookingId);

    @Query("SELECT r FROM Review r JOIN r.booking b JOIN b.vehicleModel vm WHERE vm.vehicleId = :modelId")
    List<Review> findByCarModelId(@Param("modelId") Integer modelId);
}

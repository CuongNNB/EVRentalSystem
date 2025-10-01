package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
}

package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.RenterDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RenterDetailRepository extends JpaRepository<RenterDetail, Integer> {
    Optional<RenterDetail> findByRenterUserId(Integer userId);
}

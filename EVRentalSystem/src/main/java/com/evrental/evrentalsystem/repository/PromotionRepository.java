package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
}

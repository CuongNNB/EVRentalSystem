package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    @Query("SELECT p FROM Promotion p WHERE p.endTime >= :now AND (p.status IS NULL OR LOWER(p.status) = 'active')")
    List<Promotion> findValidPromotions(@Param("now") LocalDateTime now);

    // Nếu bạn muốn một phương thức thay thế chỉ dựa vào endTime (không check status)
    List<Promotion> findByEndTimeGreaterThanEqual(LocalDateTime now);
}

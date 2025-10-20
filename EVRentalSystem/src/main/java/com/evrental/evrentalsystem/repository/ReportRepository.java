package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Integer> {
    List<Report> findByStaff_UserId(Integer staffId);

    @Query("select r from Report r order by r.createdAt desc")
    List<Report> findRecent(org.springframework.data.domain.Pageable pageable);

    default List<Report> findTopNByOrderByCreatedAtDesc(int n) {
        return findRecent(org.springframework.data.domain.PageRequest.of(0, n));
    }
}

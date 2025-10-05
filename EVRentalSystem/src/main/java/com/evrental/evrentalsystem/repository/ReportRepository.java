package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Integer> {
    List<Report> findByStaff_UserId(Integer staffId);
}

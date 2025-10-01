package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PenaltyRepository extends JpaRepository<Penalty, Integer> {
}

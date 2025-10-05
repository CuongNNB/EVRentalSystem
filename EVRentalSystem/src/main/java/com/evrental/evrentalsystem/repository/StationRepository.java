package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationRepository extends JpaRepository<Station, Integer> {
}

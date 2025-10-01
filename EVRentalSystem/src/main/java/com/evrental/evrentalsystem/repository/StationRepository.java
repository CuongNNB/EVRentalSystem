package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StationRepository extends JpaRepository<Station, Integer> {
    List<Station> findByAddressContainingIgnoreCase(String address);
}

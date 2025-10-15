package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StationRepository extends JpaRepository<Station, Integer> {
    @Query("SELECT s FROM Station s WHERE s.address LIKE %:district%")
    List<Station> findByDistrict(@Param("district") String district);

}

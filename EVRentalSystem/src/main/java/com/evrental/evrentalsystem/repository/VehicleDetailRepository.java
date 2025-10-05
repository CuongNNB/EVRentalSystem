package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehicleDetailRepository extends JpaRepository<VehicleDetail, Integer> {
    List<VehicleDetail> findByStation(Station station);
    //Lấy list các xe có sẵn
    @Query("SELECT v FROM VehicleDetail v WHERE v.vehicleModel.status = :status")
    List<VehicleDetail> findByVehicleModelStatus(@Param("status") String status);
}

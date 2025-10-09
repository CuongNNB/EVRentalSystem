package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.entity.VehicleModel;
import com.evrental.evrentalsystem.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface VehicleDetailRepository extends JpaRepository<VehicleDetail, Integer> {

    List<VehicleDetail> findByStation(Station station);
    //Lấy list các xe có sẵn
    @Query("SELECT v FROM VehicleDetail v WHERE v.status = :status")
    List<VehicleDetail> findByVehicleModelStatus(@Param("status") String status);

    //Đếm số xe có tại 1 trạm cụ thể
    @Query("SELECT COUNT(v) FROM VehicleDetail v WHERE v.station.stationId = :stationId")
    Long countVehiclesByStationId(@Param("stationId") Integer stationId);

    //Đếm số xe đang được thuê  tại 1 station cụ thể.
    @Query("SELECT COUNT(v) FROM VehicleDetail v WHERE v.station.stationId = :stationId AND v.status = 'RENTED'")
    Long countRentedVehiclesByStationId(@Param("stationId") Integer stationId);

    VehicleDetail findByLicensePlate(String licensePlate);


    @Query("""
        SELECT v FROM VehicleDetail v
        WHERE v.station.stationId = :stationId
          AND v.status = 'FIXING'
    """)
    List<VehicleDetail> findFixingVehiclesByStation(@Param("stationId") Integer stationId);

    Optional<VehicleDetail> findFirstByVehicleModelAndStatus(VehicleModel vehicleModel, String status);


    //End code here
}

package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehicleModelRepository extends JpaRepository<VehicleModel, Integer> {
    VehicleModel findByVehicleId(Integer vehicleId);

    @Query(value = """
        SELECT 
          vm.vehicle_id AS vehicleModelId,
          vm.brand,
          vm.model,
          vm.price,
          vm.seats,
          vm.picture AS modelPicture,
          COUNT(vd.id) AS availableCount
        FROM Vehicle_Model vm
        LEFT JOIN Vehicle_Detail vd
          ON vd.vehicle_id = vm.vehicle_id
          AND (:stationId IS NULL OR :stationId = 0 OR vd.station_id = :stationId)
          AND vd.[status] = 'AVAILABLE'
        GROUP BY vm.vehicle_id, vm.brand, vm.model, vm.price, vm.seats, vm.picture
        HAVING COUNT(vd.id) > 0
        """, nativeQuery = true)
    List<Object[]> findVehicleModelsByStation(@Param("stationId") Integer stationId);
}

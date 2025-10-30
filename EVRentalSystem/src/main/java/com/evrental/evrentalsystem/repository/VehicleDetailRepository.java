package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.entity.VehicleModel;
import com.evrental.evrentalsystem.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

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

    // Đếm số VehicleDetail của một vehicleId với status cho trước
    long countByVehicleModel_VehicleIdAndStatus(Integer vehicleId, String status);

    @Query("""
        SELECT v FROM VehicleDetail v
        WHERE v.station.stationId = :stationId
          AND v.status = 'FIXING'
    """)
    List<VehicleDetail> findFixingVehiclesByStation(@Param("stationId") Integer stationId);

    Optional<VehicleDetail> findFirstByVehicleModelAndStatus(VehicleModel vehicleModel, String status);
//
    @Query("""
        SELECT v FROM VehicleDetail v
        LEFT JOIN FETCH v.vehicleModel
        LEFT JOIN FETCH v.station
        WHERE v.id = :id
    """)
    Optional<VehicleDetail> findDetailWithModelAndStation(@Param("id") Integer id);

    List<VehicleDetail> findAllByVehicleModel_VehicleIdAndStation_StationIdAndStatus(Integer vehicleModelId, Integer stationId, String status);

    @Modifying
    @Transactional
    @Query("UPDATE VehicleDetail v SET v.status = :status WHERE v.id = :id")
    int updateVehicleStatusById(@Param("id") Integer id, @Param("status") String status);



    // VehicleDetailRepository.java (thêm phương thức)
    @Query("""
    SELECT v FROM VehicleDetail v
    LEFT JOIN FETCH v.vehicleModel
    WHERE v.station.stationId = :stationId
      AND v.status = :status
""")
    List<VehicleDetail> findByStationIdAndStatus(@Param("stationId") Integer stationId,
                                                 @Param("status") String status);


    @Query("""
        SELECT vd
        FROM VehicleDetail vd
        JOIN FETCH vd.station s
        JOIN FETCH vd.vehicleModel vm
        WHERE vm.vehicleId = :vehicleModelId
    """)
    List<VehicleDetail> findByVehicleModelId(@Param("vehicleModelId") Integer vehicleModelId);
    //End code here

    VehicleDetail findByLicensePlate(String licensePlate);
//ADMIN REPOSITORY BELOW//
    // Tổng theo station + status
    @Query("""
        select count(v) from VehicleDetail v
        where v.station.stationId = :stationId and upper(v.status) = upper(:status)
    """)
    long countByStationIdAndStatus(@Param("stationId") Integer stationId,
                                   @Param("status") String status);
    // Tổng theo status (phục vụ KPI utilization toàn hệ thống)
    @Query("select count(v) from VehicleDetail v where upper(v.status) = upper(:status)")
    long countByStatus(@Param("status") String status);

    List<VehicleDetail> findByStationStationId(Integer stationId);
}

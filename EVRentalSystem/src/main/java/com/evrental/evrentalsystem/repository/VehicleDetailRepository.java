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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.evrental.evrentalsystem.repository.projection.VehicleListProjection;
import com.evrental.evrentalsystem.repository.projection.StationOptionProjection;

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

    Optional<VehicleDetail> findById(Integer id);
    @Query("""
select
    v.id                            as id,
    v.licensePlate                  as licensePlate,
    vm.model                        as model,
    vm.brand                        as brand,
    v.status                        as status,
    s.stationId                     as stationId,
    s.stationName                   as stationName,
    v.odo                           as odo,
    coalesce(v.picture, vm.picture) as picture,
    vm.vehicleId                    as vehicleId
from VehicleDetail v
join v.vehicleModel vm
join v.station s
where (:status    is null or upper(v.status) = upper(:status))
  and (:stationId is null or s.stationId = :stationId)
  and (:brand     is null or lower(vm.brand) like lower(concat('%', :brand, '%')))
  and (:model     is null or lower(vm.model) like lower(concat('%', :model, '%')))
  and (
     :q is null
     or lower(v.licensePlate) like lower(concat('%', :q, '%'))
     or lower(vm.model)       like lower(concat('%', :q, '%'))
     or lower(vm.brand)       like lower(concat('%', :q, '%'))
     or lower(s.stationName)  like lower(concat('%', :q, '%'))
  )
""")
    Page<VehicleListProjection> searchVehicleList(
            @Param("q") String q,
            @Param("status") String status,
            @Param("stationId") Integer stationId,
            @Param("brand") String brand,
            @Param("model") String model,
            Pageable pageable
    );


    // === ADD: Distinct brands (optional filter by status, station) ===
    @Query("""
    select distinct vm.brand
    from VehicleDetail v
    join v.vehicleModel vm
    where (:status    is null or upper(v.status) = upper(:status))
      and (:stationId is null or v.station.stationId = :stationId)
    order by vm.brand
""")
    List<String> findDistinctBrands(
            @Param("status") String status,
            @Param("stationId") Integer stationId
    );

    // === ADD: Distinct models (optional filter by brand, status, station) ===
    @Query("""
    select distinct vm.model
    from VehicleDetail v
    join v.vehicleModel vm
    where (:brand     is null or lower(vm.brand) like lower(concat('%', :brand, '%')))
      and (:status    is null or upper(v.status) = upper(:status))
      and (:stationId is null or v.station.stationId = :stationId)
    order by vm.model
""")
    List<String> findDistinctModels(
            @Param("brand") String brand,
            @Param("status") String status,
            @Param("stationId") Integer stationId
    );

}

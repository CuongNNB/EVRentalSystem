package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    List<User> findByRole(String role);  // Tìm người dùng theo role (ADMIN, STAFF, RENTER)
    List<User> findByStatus(String status);  // Tìm người dùng theo trạng thái

    @Query("""
        SELECT u 
        FROM User u 
        JOIN EmployeeDetail e ON e.employee = u
        WHERE u.role = 'ADMIN' AND e.station.stationId = :stationId
    """)
    Optional<User> findAdminByStationId(@Param("stationId") Integer stationId);
}

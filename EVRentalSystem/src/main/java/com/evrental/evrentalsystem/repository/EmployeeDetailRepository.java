package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.EmployeeDetail;
import com.evrental.evrentalsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeDetailRepository extends JpaRepository<EmployeeDetail, Integer> {
    Optional<EmployeeDetail> findByEmployee(User user);
}

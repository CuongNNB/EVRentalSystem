package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    boolean existsByRoleName(String roleName);
}

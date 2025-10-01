package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, Integer> {
}

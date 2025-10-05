package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Integer> {
    Optional<Contract> findByBooking_BookingId(Integer bookingId);
}

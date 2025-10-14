package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Integer> {
    Optional<Contract> findByBooking_BookingId(Integer bookingId);

    @Query("""
        SELECT c FROM Contract c
        WHERE c.booking.renter.userId = :userId
        ORDER BY 
            CASE 
                WHEN c.status IS NULL OR UPPER(c.status) <> 'SIGNED' THEN 0 
                ELSE 1 
            END,
            c.contractId DESC
    """)
    List<Contract> findAllOrderedForUser(@Param("userId") Integer userId);
}

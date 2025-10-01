package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
}

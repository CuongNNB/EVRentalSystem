package com.evrental.evrentalsystem.repository;

import com.evrental.evrentalsystem.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Integer> {
}

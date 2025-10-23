package com.evrental.evrentalsystem.service;
import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.Payment;
import com.evrental.evrentalsystem.entity.Promotion;
import com.evrental.evrentalsystem.repository.BookingRepository;
import com.evrental.evrentalsystem.repository.PaymentRepository;
import com.evrental.evrentalsystem.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PromotionRepository promotionRepository;
}

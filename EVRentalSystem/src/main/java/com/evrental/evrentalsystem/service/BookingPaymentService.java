package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.Payment;
import com.evrental.evrentalsystem.entity.Promotion;
import com.evrental.evrentalsystem.enums.BookingStatus;
import com.evrental.evrentalsystem.repository.BookingRepository;
import com.evrental.evrentalsystem.repository.PaymentRepository;
import com.evrental.evrentalsystem.repository.PromotionRepository;
import com.evrental.evrentalsystem.request.UpdatePaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class BookingPaymentService {

    private final BookingRepository bookingRepository;
    private final PromotionRepository promotionRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Cập nhật Booking (gán promotion nếu có) và tạo / cập nhật Payment cho booking.
     *
     * @param req DTO chứa bookingId, promotionId (nullable), totalCharged
     * @return updated Payment
     */
    @Transactional
    public Payment updateBookingAndPayment(UpdatePaymentRequest req) {
        if (req.getBookingId() == null) {
            throw new IllegalArgumentException("bookingId is required");
        }

        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new NoSuchElementException("Booking not found with id: " + req.getBookingId()));

        // Xử lý Promotion: nếu promotionId != null -> tìm promotion gán vào booking;
        // nếu promotionId == null -> bỏ promotion (set null)
        if (req.getPromotionId() != null) {
            Promotion promo = promotionRepository.findById(req.getPromotionId())
                    .orElseThrow(() -> new NoSuchElementException("Promotion not found with id: " + req.getPromotionId()));
            booking.setPromotion(promo);
        } else {
            booking.setPromotion(null);
        }

        // Chỉnh lại booking thành completed
        booking.setStatus(BookingStatus.Total_Fees_Charged.toString());

        // Lưu booking trước (tránh transient issues)
        bookingRepository.save(booking);

        // Tạo hoặc cập nhật Payment
        Payment payment = paymentRepository.findByBooking(booking)
                .map(existing -> {
                    existing.setTotal(req.getTotalCharged());
                    existing.setPaidAt(LocalDateTime.now());
                    return existing;
                })
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setBooking(booking);
                    p.setTotal(req.getTotalCharged());
                    p.setPaidAt(LocalDateTime.now());
                    return p;
                });

        Payment savedPayment = paymentRepository.save(payment);

        // trả về payment đã lưu
        return savedPayment;
    }
}
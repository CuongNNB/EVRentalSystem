package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.Contract;
import com.evrental.evrentalsystem.enums.BookingStatus;
import com.evrental.evrentalsystem.repository.BookingRepository;
import com.evrental.evrentalsystem.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ContractService {
    private final BookingRepository bookingRepository;
    private final ContractRepository contractRepository;
    private final MailService mailService;
     private final OtpService otpService;

    @Transactional
    public String sendOtpForContract(Integer bookingId, String email) {
        var boooking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng cho bookingId " + bookingId));
        Contract contract = contractRepository.findByBooking_BookingId(bookingId)
                .orElseGet(Contract::new);
        String otp = otpService.generateOtp(bookingId);
        contract.setBooking(boooking);
        contract.setOtpCode(otp);
        contract.setStatus("WATING_FOR_VERIFICATION");
        contractRepository.save(contract);

        mailService.sendOtpMail(email, otp);
        return "Đã gửi OTP tới " + email;
    }

    @Transactional
    public String verifyOtp(Integer bookingId, String otp) {
        boolean valid = otpService.verifyOtp(bookingId, otp);
        var contract = contractRepository.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng"));

        if (valid) {
            contract.setSignedAt(LocalDateTime.now());
            contract.setStatus("SIGNED");
            contractRepository.save(contract);
            Booking booking = bookingRepository.findByBookingId(bookingId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bookingId: " + bookingId));
            booking.setStatus(BookingStatus.Pending_Vehicle_Pickup.toString()); // hoặc "APPROVED" / "ACTIVE" tùy theo business
            bookingRepository.save(booking);

            return "Hợp đồng đã được xác nhận thành công.";
        } else {
            return "OTP không hợp lệ hoặc đã hết hạn.";
        }
    }
}

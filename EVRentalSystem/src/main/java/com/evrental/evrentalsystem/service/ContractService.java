package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final MailService mailService;
     private final OtpService otpService;

    @Transactional
    public String sendOtpForContract(Integer bookingId, String email) {
        var contract = contractRepository.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng cho bookingId " + bookingId));

        String otp = otpService.generateOtp(bookingId);
        contract.setOtpCode(otp);
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
            contract.setStatus("SIGNED");
            contractRepository.save(contract);
            return "✅ Hợp đồng đã được xác nhận thành công.";
        } else {
            return "❌ OTP không hợp lệ hoặc đã hết hạn.";
        }
    }
}

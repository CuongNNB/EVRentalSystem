package com.evrental.evrentalsystem.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

     private final JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpMail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Hệ thống cho thuê xe điện EV Rental - Mã xác nhận hợp đồng");
            helper.setText("""
                    <p>Xin chào bạn,</p>
                    <p>Mã OTP xác nhận ký hợp đồng của bạn là: <b>%s</b></p>
                    <p>Mã có hiệu lực trong 5 phút.</p>
                    <br>
                    <p>Trân trọng,<br>Đội ngũ EVRental</p>
                    """.formatted(otpCode), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        }
    }
}

package com.evrental.evrentalsystem.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

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

            helper.setFrom(new InternetAddress(fromEmail, "EV Rental System"));
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
        }catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Lỗi encoding tên người gửi: " + e.getMessage());
        }
    }

    public void sendContractCreatedMail(String toEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Hiển thị tên người gửi thay vì chỉ Gmail
            helper.setFrom(new InternetAddress(fromEmail, "EV Rental System"));
            helper.setTo(toEmail);
            helper.setSubject("EV Rental - Hợp đồng thuê xe đã được tạo thành công");

            // Nội dung email (HTML)
            helper.setText("""
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <p>Xin chào bạn,</p>
                    <p>Đơn đặt xe của bạn đã được nhân viên xác nhận!</p>
                    <p>Bạn vui lòng ký hợp đồng thuê xe  
                        <a href="http://localhost:5173/user-contract" 
                           style="color:#009B72; text-decoration:none; font-weight:bold;">
                           Tại đây
                        </a>.
                    </p>
                    <br>
                    <p>Trân trọng,<br>Đội ngũ <b>EV Rental</b></p>
                </div>
                """, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi khi gửi email thông báo hợp đồng: " + e.getMessage());
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Lỗi encoding tên người gửi: " + e.getMessage());
        }
    }
}

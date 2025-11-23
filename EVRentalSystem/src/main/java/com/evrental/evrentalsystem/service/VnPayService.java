package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.config.VnPayProperties;
import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.enums.BookingStatus;
import com.evrental.evrentalsystem.repository.BookingRepository;
import com.evrental.evrentalsystem.util.VnPayUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VnPayService {

    private final VnPayProperties props;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public String createPaymentUrl(Long amountVnd, String orderInfo, String orderId, String clientIp, String locale) {
        try {
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", props.getTmnCode());

            // amount multiply by 100
            long amountLong = amountVnd * 100L;
            vnpParams.put("vnp_Amount", String.valueOf(amountLong));

            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", orderId);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", (locale == null ? "vn" : locale));
            vnpParams.put("vnp_ReturnUrl", props.getReturnUrl());

            // timezone Asia/Ho_Chi_Minh (GMT+7)
            ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");
            vnpParams.put("vnp_CreateDate", LocalDateTime.now(zone).format(DATE_FORMAT));
            vnpParams.put("vnp_ExpireDate", LocalDateTime.now(zone).plusMinutes(15).format(DATE_FORMAT));
            vnpParams.put("vnp_IpAddr", clientIp);

            // force QR
            vnpParams.put("vnp_BankCode", "NCB");

            // Build hashData (encoded keys & values)
            String hashData = VnPayUtils.buildQueryString(vnpParams);
            String secureHash = VnPayUtils.hmacSHA512(props.getHashSecret(), hashData);

            // Build redirect query (encoded) + secure hash
            String query = hashData + "&vnp_SecureHash=" + secureHash;
            return props.getPayUrl() + "?" + query;
        } catch (Exception ex) {
            throw new RuntimeException("Error building VNPay payment URL", ex);
        }
    }

    public boolean validateSecureHash(Map<String, String> params) {
        try {
            Map<String, String> copy = new HashMap<>(params);
            String receivedSecureHash = copy.remove("vnp_SecureHash");
            // Build hashData from remaining params (encoded)
            String hashData = VnPayUtils.buildQueryString(copy);
            String myHash = VnPayUtils.hmacSHA512(props.getHashSecret(), hashData);
            return myHash.equalsIgnoreCase(receivedSecureHash);
        } catch (Exception ex) {
            return false;
        }
    }

    private final BookingRepository bookingRepository;

    public String updateBookingStatus(Integer bookingId) {
        Booking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Not found booking!"));
        booking.setStatus(BookingStatus.Total_Fees_Charged);
        bookingRepository.save(booking);
        return "Booking confirmed successfully.";
    }
}
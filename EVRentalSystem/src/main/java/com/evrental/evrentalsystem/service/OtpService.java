package com.evrental.evrentalsystem.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Map<Integer, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final Random random = new Random();


    public String generateOtp(Integer bookingId) {
        String otp = String.format("%06d", random.nextInt(999999));
        otpStorage.put(bookingId, new OtpData(otp, LocalDateTime.now().plusMinutes(5), 0));
        return otp;
    }


    public boolean verifyOtp(Integer bookingId, String otp) {
        OtpData data = otpStorage.get(bookingId);
        if (data == null) return false;

        if (LocalDateTime.now().isAfter(data.expiry())) {
            otpStorage.remove(bookingId);
            return false; // Hết hạn
        }

        if (data.code().equals(otp)) {
            otpStorage.remove(bookingId);
            return true;
        } else {
            data.incrementAttempts();
            if (data.attempts() >= 3) {
                otpStorage.remove(bookingId);
            }
            return false;
        }
    }

    private static class OtpData {
        private final String code;
        private final LocalDateTime expiry;
        private int attempts;

        public OtpData(String code, LocalDateTime expiry, int attempts) {
            this.code = code;
            this.expiry = expiry;
            this.attempts = attempts;
        }

        public String code() { return code; }
        public LocalDateTime expiry() { return expiry; }
        public int attempts() { return attempts; }
        public void incrementAttempts() { attempts++; }
    }
}

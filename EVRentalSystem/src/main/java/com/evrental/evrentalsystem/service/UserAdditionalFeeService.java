package com.evrental.evrentalsystem.service;
import com.evrental.evrentalsystem.entity.AdditionalFee;
import com.evrental.evrentalsystem.repository.AdditionalFeeRepository;
import com.evrental.evrentalsystem.response.user.UserAdditionalFeeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAdditionalFeeService {
    private final AdditionalFeeRepository additionalFeeRepository;

    /**
     * Lấy danh sách AdditionalFeeResponse theo bookingId.
     * Trả về list rỗng nếu không có fee nào.
     */
    public List<UserAdditionalFeeResponse> getAdditionalFeesByBookingId(Integer bookingId) {
        List<AdditionalFee> fees = additionalFeeRepository.findByBooking_BookingId(bookingId);

        return fees.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UserAdditionalFeeResponse mapToResponse(AdditionalFee fee) {
        UserAdditionalFeeResponse res = new UserAdditionalFeeResponse();
        res.setFeeId(fee.getFeeId());
        // Booking có thể là null (không khả dụng) — kiểm tra an toàn:
        if (fee.getBooking() != null) {
            try {
                // giả sử Booking có getter getBookingId()
                res.setBookingId((Integer) fee.getBooking().getClass()
                        .getMethod("getBookingId")
                        .invoke(fee.getBooking()));
            } catch (Exception e) {
                // nếu không tìm thấy method, bỏ qua (bookingId sẽ null)
                res.setBookingId(null);
            }
        }
        res.setFeeName(fee.getFeeName().toString());
        res.setAmount(fee.getAmount());
        res.setDescription(fee.getDescription());
        res.setCreatedAt(fee.getCreatedAt());
        return res;
    }
}

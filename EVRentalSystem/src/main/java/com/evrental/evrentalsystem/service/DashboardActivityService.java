package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.repository.*;
import com.evrental.evrentalsystem.response.admin.ActivityFeedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;

import static com.evrental.evrentalsystem.service.DashboardTime.*;

@Service
@RequiredArgsConstructor
public class DashboardActivityService {
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final AdditionalFeeRepository additionalFeeRepository;
    private final ContractRepository contractRepository;
    private final ReportRepository reportRepository;

    public ActivityFeedResponse feed(int limit) {
        int top = Math.max(1, limit);
        ArrayList<ActivityFeedResponse.Activity> items = new ArrayList<>();

        // booking
        for (var b : bookingRepository.findTopNByOrderByCreatedAtDesc(top)) {
            items.add(new ActivityFeedResponse.Activity(
                    iso(b.getCreatedAt()), "BOOKING",
                    "Đơn thuê #" + b.getBookingId() + " được tạo"
            ));
        }

        // payment
        for (var p : paymentRepository.findTopNByOrderByPaidAtDesc(top)) {
            items.add(new ActivityFeedResponse.Activity(
                    iso(p.getPaidAt()), "PAYMENT",
                    "Thanh toán hoàn tất cho đơn #" + p.getBooking().getBookingId()
                            + ": " + p.getTotal() + " VND"
            ));
        }

        // fee
        for (var f : additionalFeeRepository.findTopNByOrderByCreatedAtDesc(top)) {
            items.add(new ActivityFeedResponse.Activity(
                    iso(f.getCreatedAt()), "FEE",
                    "Phụ phí cho đơn #" + f.getBooking().getBookingId()
                            + ": " + f.getFeeName() + " (" + f.getAmount() + " VND)"
            ));
        }

        // contract
        for (var c : contractRepository.findTopNByOrderBySignedAtDesc(top)) {
            items.add(new ActivityFeedResponse.Activity(
                    iso(c.getSignedAt()), "CONTRACT",
                    "Hợp đồng cho đơn #" + c.getBooking().getBookingId() + " được ký"
            ));
        }

        // report
        for (var r : reportRepository.findTopNByOrderByCreatedAtDesc(top)) {
            items.add(new ActivityFeedResponse.Activity(
                    iso(r.getCreatedAt()), "REPORT",
                    "Báo cáo từ nhân viên #" + r.getStaff().getUserId()
                            + " về xe detail #" + r.getVehicleDetail().getId()
            ));
        }

        items.sort(Comparator.comparing(ActivityFeedResponse.Activity::getTime,
                Comparator.nullsLast(String::compareTo)).reversed());
        if (items.size() > top) {
            items = new ArrayList<>(items.subList(0, top));
        }

        return new ActivityFeedResponse(items);
    }
}

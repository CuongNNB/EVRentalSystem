package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.enums.UserEnum;
import com.evrental.evrentalsystem.enums.VehicleStatus;
import com.evrental.evrentalsystem.repository.*;
import com.evrental.evrentalsystem.response.admin.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static com.evrental.evrentalsystem.service.DashboardTime.*;

@Service
@RequiredArgsConstructor
public class DashboardOverviewService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final VehicleDetailRepository vehicleDetailRepository;

    public OverviewMetricsResponse metrics(String from, String to) {
        // Khoảng ngày lấy dữ liệu (mặc định 7 ngày nếu không có from/to)
        LocalDate[] r = range(from, to, 7);
        LocalDate today = LocalDate.now(ZONE);

        LocalDateTime start = r[0].atStartOfDay(ZONE).toLocalDateTime();
        LocalDateTime endEx = r[1].plusDays(1).atStartOfDay(ZONE).toLocalDateTime();
        long totalRevenue = nz(paymentRepository.sumTotalBetween(start, endEx));

        // Thống kê hôm nay
        LocalDateTime t0 = today.atStartOfDay(ZONE).toLocalDateTime();
        LocalDateTime t1 = today.plusDays(1).atStartOfDay(ZONE).toLocalDateTime();
        int rentalsToday = bookingRepository.countByStartTimeBetween(t0, t1);

        int totalCustomers = userRepository.findByRole(UserEnum.RENTER).size();
        long totalVehicles = vehicleDetailRepository.count();



        // So sánh kỳ trước (để tính phần trăm tăng trưởng)
        long days = windowDays(r[0], r[1]);
        LocalDateTime prevStart = r[0].minusDays(days).atStartOfDay(ZONE).toLocalDateTime();
        LocalDateTime prevEnd = r[0].atStartOfDay(ZONE).toLocalDateTime();
        long prevRevenue = nz(paymentRepository.sumTotalBetween(prevStart, prevEnd));

        int prevRentals = bookingRepository.countByStartTimeBetween(
                today.minusDays(1).atStartOfDay(ZONE).toLocalDateTime(),
                today.atStartOfDay(ZONE).toLocalDateTime()
        );

        // Trả về kết quả
        return OverviewMetricsResponse.builder()
                .totalRevenue(totalRevenue)
                .rentalsToday(rentalsToday)
                .totalCustomers(totalCustomers)
                .delta(OverviewMetricsResponse.Delta.builder()
                        .revenue(pctDelta(prevRevenue, totalRevenue))
                        .rentals(pctDelta(prevRentals, rentalsToday))
                        .build())
                .build();
    }

    public RevenueSeriesResponse revenueSeries(Integer period, String from, String to) {
        LocalDate[] r = range(from, to, period != null ? period : 7);
        long total = 0L;
        var points = new java.util.ArrayList<RevenueSeriesResponse.Point>();

        for (LocalDate d = r[0]; !d.isAfter(r[1]); d = d.plusDays(1)) {
            LocalDateTime a = d.atStartOfDay(ZONE).toLocalDateTime();
            LocalDateTime b = d.plusDays(1).atStartOfDay(ZONE).toLocalDateTime();
            long day = nz(paymentRepository.sumTotalBetween(a, b));

            total += day;
            points.add(new RevenueSeriesResponse.Point(DATE_FMT.format(d), day));
        }

        return new RevenueSeriesResponse(points, total);
    }
}

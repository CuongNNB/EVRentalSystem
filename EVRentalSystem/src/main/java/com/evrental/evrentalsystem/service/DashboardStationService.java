package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.enums.VehicleStatus;
import com.evrental.evrentalsystem.repository.*;
import com.evrental.evrentalsystem.response.admin.*;
import com.evrental.evrentalsystem.response.vehicle.FixingVehicleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.Comparator;
import java.util.stream.Collectors;

import static com.evrental.evrentalsystem.service.DashboardTime.*;

@Service
@RequiredArgsConstructor
public class DashboardStationService {
    private final StationRepository stationRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final VehicleDetailRepository vehicleDetailRepository;

    public TopStationsResponse topStations(Integer limit, String from, String to) {
        int top = limit != null ? limit : 5;

        var r = range(from, to, 7);
        LocalDateTime start = r[0].atStartOfDay(ZONE).toLocalDateTime();
        LocalDateTime endEx = r[1].plusDays(1).atStartOfDay(ZONE).toLocalDateTime();

        var rows = stationRepository.findAll().stream().map(st -> {
                    int rentals = bookingRepository.countByStationIdAndCreatedAtBetween(
                            st.getStationId(), start, endEx);

                    long revenue = nz(paymentRepository.sumTotalByStationBetween(
                            st.getStationId(), start, endEx));

                    long totalV = nz(vehicleDetailRepository.countVehiclesByStationId(st.getStationId()));


                    return TopStationsResponse.StationRow.builder()
                            .stationId(st.getStationId())
                            .stationName(st.getStationName())
                            .rentals(rentals)
                            .revenue(revenue)
                            .build();
                }).sorted(Comparator
                        .comparing(TopStationsResponse.StationRow::getRevenue).reversed()
                        .thenComparing(TopStationsResponse.StationRow::getRentals).reversed())
                .limit(top)
                .collect(Collectors.toList());

        return new TopStationsResponse(rows);
    }


    public TotalVehicleResponse totalByStation(Integer stationId) {
        Station st = station(stationId);
        long total = nz(vehicleDetailRepository.countVehiclesByStationId(stationId));
        return new TotalVehicleResponse(st.getStationId(), st.getStationName(), total);
    }

    public RentedVehicleResponse rentedByStation(Integer stationId) {
        Station st = station(stationId);
        long rented = vehicleDetailRepository.countByStationIdAndStatus(stationId, VehicleStatus.RENTED);
        return new RentedVehicleResponse(st.getStationId(), st.getStationName(), rented);
    }

    public FixingVehicleResponse fixingByStation(Integer stationId) {
        Station st = station(stationId);
        var vehicles = vehicleDetailRepository.findFixingVehiclesByStation(stationId);
        var list = vehicles.stream().map(v -> new FixingVehicleResponse.VehicleInfo(
                v.getId(), nz(v.getLicensePlate()), nz(v.getColor()),
                nz(v.getBatteryCapacity()),
                v.getVehicleModel() != null ? nz(v.getVehicleModel().getModel()) : "",
                nz(v.getStatus().toString())
        )).toList();
        return new FixingVehicleResponse(st.getStationName(), list.size(), list);
    }

    private Station station(Integer id) {
        if (id == null) throw new IllegalArgumentException("stationId không được null");
        return stationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy trạm với ID: " + id));
    }
}

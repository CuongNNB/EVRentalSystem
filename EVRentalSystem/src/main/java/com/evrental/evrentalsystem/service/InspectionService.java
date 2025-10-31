package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.InspectionAfter;
import com.evrental.evrentalsystem.enums.BookingStatus;
import com.evrental.evrentalsystem.enums.InspectionStatusEnum;
import com.evrental.evrentalsystem.repository.BookingRepository;
import com.evrental.evrentalsystem.repository.InspectionAfterRepository;
import com.evrental.evrentalsystem.response.vehicle.UserInspectionDetailResponse;
import com.evrental.evrentalsystem.entity.Inspection;
import com.evrental.evrentalsystem.repository.InspectionRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final InspectionAfterRepository inspectionAfterRepository;
    private final BookingRepository bookingRepository;

    public List<UserInspectionDetailResponse> getInspectionsByBookingId(Integer bookingId) {
        List<Inspection> inspections = inspectionRepository.findByBooking_BookingId(bookingId);
        return inspections.stream().map(this::toDtoBefore).collect(Collectors.toList());
    }

    private UserInspectionDetailResponse toDtoBefore(Inspection insp) {
        UserInspectionDetailResponse dto = new UserInspectionDetailResponse();

        dto.setInspectionId(insp.getInspectionId());
        if (insp.getBooking() != null)
            dto.setBookingId(insp.getBooking().getBookingId());

        dto.setPartName(insp.getPartName());
        dto.setDescription(insp.getDescription());
        dto.setStatus(insp.getStatus());
        dto.setInspectedAt(insp.getInspectedAt());

        if (insp.getStaff() != null) {
            dto.setStaffId(insp.getStaff().getUserId());
            dto.setStaffName(insp.getStaff().getFullName());
        }

        // Trả URL ảnh thay vì dữ liệu ảnh
        dto.setPictureUrl(String.format(
                "http://localhost:8084/EVRentalSystem/api/inspections/%d/picture",
                insp.getInspectionId()
        ));

        return dto;
    }

    public List<UserInspectionDetailResponse> getInspectionsAfter(Integer bookingId) {
        List<InspectionAfter> inspections = inspectionAfterRepository.findByBooking_BookingId(bookingId);
        return inspections.stream().map(this::toDtoAfter).collect(Collectors.toList());
    }

    private UserInspectionDetailResponse toDtoAfter(InspectionAfter insp) {
        UserInspectionDetailResponse dto = new UserInspectionDetailResponse();

        dto.setInspectionId(insp.getInspectionId());
        if (insp.getBooking() != null)
            dto.setBookingId(insp.getBooking().getBookingId());

        dto.setPartName(insp.getPartName());
        dto.setDescription(insp.getDescription());
        dto.setStatus(insp.getStatus());
        dto.setInspectedAt(insp.getInspectedAt());

        if (insp.getStaff() != null) {
            dto.setStaffId(insp.getStaff().getUserId());
            dto.setStaffName(insp.getStaff().getFullName());
        }

        // Trả URL ảnh thay vì dữ liệu ảnh
        dto.setPictureUrl(String.format(
                "http://localhost:8084/EVRentalSystem/api/inspections/%d/picture-after",
                insp.getInspectionId()
        ));

        return dto;
    }

    //API: http://localhost:8084/EVRentalSystem/api/inspections/update-status

    /// RequestBody:
    ///  "bookingId": Integer,
    ///   "status": String (PENDING, CONFIRMED, REJECTED)
    public List<Inspection> updateInspectionStatus(Integer bookingId, String status) {
        List<Inspection> inspections = inspectionRepository.findByBooking_BookingId(bookingId);

        if (inspections.isEmpty()) {
            return inspections;
        }

        for (Inspection inspection : inspections) {
            inspection.setStatus(status);
        }

        Booking checkBooking = bookingRepository.findById(bookingId).orElse(null);
        checkBooking.setStatus(BookingStatus.Vehicle_Inspected_Before_Pickup.toString());

        if (status.equals(InspectionStatusEnum.REJECTED.toString())) {
            bookingRepository.findById(bookingId).ifPresent(booking -> {
                booking.setStatus(BookingStatus.Vehicle_Inspected_Before_Pickup.toString());
                bookingRepository.save(booking);
            });
            int deleted = inspectionRepository.deleteByBookingIdAndStatus(bookingId, InspectionStatusEnum.REJECTED.toString());
        }
        return inspectionRepository.saveAll(inspections);
    }

    @Transactional
    public int deleteRejectedInspectionsByBookingId(Integer bookingId) {
        return inspectionRepository.deleteByBookingIdAndStatus(bookingId, InspectionStatusEnum.REJECTED.toString());
    }



    //End code here
}

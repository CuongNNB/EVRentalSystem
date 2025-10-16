package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.response.vehicle.UserInspectionDetailResponse;
import com.evrental.evrentalsystem.entity.Inspection;
import com.evrental.evrentalsystem.repository.InspectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InspectionService {
    private final InspectionRepository inspectionRepository;

    public InspectionService(InspectionRepository inspectionRepository) {
        this.inspectionRepository = inspectionRepository;
    }

    public List<UserInspectionDetailResponse> getInspectionsByBookingId(Integer bookingId) {
        List<Inspection> inspections = inspectionRepository.findByBooking_BookingId(bookingId);
        return inspections.stream().map(this::toDto).collect(Collectors.toList());
    }

    private UserInspectionDetailResponse toDto(Inspection insp) {
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
}

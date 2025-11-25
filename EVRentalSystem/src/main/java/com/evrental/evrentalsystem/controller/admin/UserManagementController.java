package com.evrental.evrentalsystem.controller.admin;


import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.RenterDetail;
import com.evrental.evrentalsystem.entity.User;
import com.evrental.evrentalsystem.enums.StaffStatusEnum;
import com.evrental.evrentalsystem.enums.UserEnum;
import com.evrental.evrentalsystem.request.BookingUpdateRequest;
import com.evrental.evrentalsystem.request.UpdateRenterDetailRequest;
import com.evrental.evrentalsystem.response.admin.BookingAdminDto;
import com.evrental.evrentalsystem.response.admin.GetAllUserResponse;
import com.evrental.evrentalsystem.response.admin.GetRenterDetailResponse;
import com.evrental.evrentalsystem.service.AdminService;
import com.evrental.evrentalsystem.service.UserService;
import com.evrental.evrentalsystem.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-management")
public class UserManagementController {

    private final AdminService adminService;

    //API: http://localhost:8084/EVRentalSystem/api/user-management/renters
    @GetMapping("/renters")
    public List<GetAllUserResponse> getAllRenters() {
        return adminService.getAllUsersByRole(UserEnum.RENTER);
    }

    //API: http://localhost:8084/EVRentalSystem/api/user-management/{userId}/renter-detail
    @GetMapping("/{userId}/renter-detail")
    public ResponseEntity<?> getRenterDetail(@PathVariable Integer userId) {
        Optional<RenterDetail> opt = adminService.findByUserId(userId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        RenterDetail entity = opt.get();

        // build base image endpoint: /api/users/{userId}/renter-detail/image
        String baseImageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/users/{userId}/renter-detail/image")
                .buildAndExpand(userId)
                .toUriString();

        GetRenterDetailResponse dto = adminService.toDto(entity, baseImageUrl);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{userId}/renter-detail/image")
    public ResponseEntity<byte[]> getRenterDetailImage(
            @PathVariable Integer userId,
            @RequestParam(name = "type", defaultValue = "cccd_front") String type) {

        Optional<RenterDetail> opt = adminService.findByUserId(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        RenterDetail detail = opt.get();

        // đảm bảo owner: nếu RenterDetail dùng MapsId thì renterId == userId; kiểm tra này giúp tránh leak
        if (detail.getRenter() == null || !userId.equals(detail.getRenter().getUserId())) {
            return ResponseEntity.status(403).build();
        }

        String base64;
        switch (type.toLowerCase()) {
            case "cccd_front":
                base64 = detail.getCccdFront();
                break;
            case "cccd_back":
                base64 = detail.getCccdBack();
                break;
            case "driver_license":
                base64 = detail.getDriverLicense();
                break;
            default:
                return ResponseEntity.badRequest().build();
        }

        byte[] bytes = adminService.decodeImage(base64);
        if (bytes == null || bytes.length == 0) return ResponseEntity.notFound().build();

        String mime = adminService.detectMime(bytes);
        return ImageUtil.buildImageResponse(bytes, mime);
    }

    //API: http://localhost:8084/EVRentalSystem/api/user-management/{userId}/renter-detail
    @PutMapping("/{userId}/renter-detail")
    public ResponseEntity<?> updateRenterDetail(
            @PathVariable Integer userId,
            @RequestBody UpdateRenterDetailRequest request) {

        // Đảm bảo path userId trùng với request.userId
        if (!userId.equals(request.getUserId())) {
            return ResponseEntity.badRequest().body("Path userId and request.userId must match.");
        }

        try {
            adminService.updateRenterDetail(request);
            return ResponseEntity.ok("Update renter detail successfully for userId: " + userId + "!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    //API: http://localhost:8084/EVRentalSystem/api/user-management/get-bookings
    @GetMapping("/get-bookings")
    public ResponseEntity<List<BookingAdminDto>> getAllBookings() {
        List<BookingAdminDto> dtos = adminService.getAllBookingsForAdmin();
        return ResponseEntity.ok(dtos);
    }

    //API: http://localhost:8084/EVRentalSystem/api/user-management/update-booking
    @PutMapping("/update-booking")
    public ResponseEntity<?> updateRenterBooking(@RequestBody BookingUpdateRequest request) {
        try {
            if (request.getBookingId() == null) {
                return ResponseEntity.badRequest().body("Booking ID là bắt buộc");
            }
            Booking updatedBooking = adminService.updateRenterBooking(request);
            return ResponseEntity.ok(updatedBooking);
        } catch (RuntimeException e) {
            // Trả về lỗi 400 cho các lỗi nghiệp vụ (sai trạng thái, xe bận...)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}

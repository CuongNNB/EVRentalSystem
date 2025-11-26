package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.RenterDetail;
import com.evrental.evrentalsystem.enums.RenterDetailVerificationStatusEnum;
import com.evrental.evrentalsystem.enums.StaffStatusEnum;
import com.evrental.evrentalsystem.enums.UserEnum;
import com.evrental.evrentalsystem.repository.RenterDetailRepository;
import com.evrental.evrentalsystem.repository.UserRepository;
import com.evrental.evrentalsystem.entity.User;
import com.evrental.evrentalsystem.request.*;
import com.evrental.evrentalsystem.response.*;
import com.evrental.evrentalsystem.response.user.RenterDetailResponse;
import com.evrental.evrentalsystem.response.user.UpdateUserProfile;
import com.evrental.evrentalsystem.response.user.UserLoginResponse;
import com.evrental.evrentalsystem.response.user.UserResponse;
import com.evrental.evrentalsystem.security.JwtService;
import com.evrental.evrentalsystem.util.ImageUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RenterDetailRepository renterDetailRepository;

    private final ObjectMapper objectMapper; // inject Jackson's ObjectMapper


    @Transactional
    public UserResponse register(UserRegisterRequest request, MultipartFile gplx, MultipartFile cccdFront, MultipartFile cccdBack) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setAddress(request.getAddress());
        user.setRole(UserEnum.RENTER.toString());
        user.setStatus(StaffStatusEnum.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // save inf renter with base64 images

        RenterDetail detail = new RenterDetail();
        detail.setRenter(savedUser);
        detail.setCccdFront(encodeToBase64(cccdFront));
        detail.setCccdBack(encodeToBase64(cccdBack));
        detail.setDriverLicense(encodeToBase64(gplx));
        detail.setVerificationStatus(RenterDetailVerificationStatusEnum.PENDING);
        detail.setIsRisky(false);
        renterDetailRepository.saveAndFlush(detail);

        return toUserResponse(savedUser);
    }

    private String encodeToBase64(MultipartFile file) {
        try {
            if (file != null && !file.isEmpty()) {
                return Base64.getEncoder().encodeToString(file.getBytes());
            } else {
                throw new RuntimeException("File upload bị trống!");
            }
        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc file: " + file.getOriginalFilename(), e);
        }
    }

    public UserLoginResponse login(UserLoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        String username = request.getUsername();


        if ((email == null || email.trim().isEmpty()) &&
                (username == null || username.trim().isEmpty())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email hoặc Username là bắt buộc!"
            );
        }

        if (password == null || password.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mật khẩu là bắt buộc!"
            );
        }

        User user;

        if (email != null && !email.trim().isEmpty()) {
            user = userRepository.findByEmail(email.trim().toLowerCase())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với email này!"
                    ));
        } else {
            user = userRepository.findByUsername(username.trim())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với username này!"
                    ));
        }

        if (!user.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai mật khẩu!");
        }

        String token = jwtService.generateToken(user.getUsername());

        String cccdFront = null;
        String cccdBack = null;
        String driverLicense = null;
        String baseUrl = "http://localhost:8084/EVRentalSystem/api/users/";
        if (user.getRenterDetail() != null) {
            cccdFront = "http://localhost:8084/EVRentalSystem/api/users/" + user.getUserId() + "/renter-detail/cccd-front";
            cccdBack = "http://localhost:8084/EVRentalSystem/api/users/" + user.getUserId() + "/renter-detail/cccd-back";
            driverLicense = "http://localhost:8084/EVRentalSystem/api/users/" + user.getUserId() + "/renter-detail/driver-license";
        }

        return new UserLoginResponse(
                user.getUserId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().toString(),
                user.getPhone(),
                user.getAddress(),
                user.getCreatedAt(),
                cccdFront,
                cccdBack,
                driverLicense,
                token
        );
    }

    public UserResponse updateProfile(Integer id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setAddress(request.getAddress());

        User updated = userRepository.save(user);
        return toUserResponse(updated);
    }


    public ApiResponse changePassword(Integer id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setPassword(request.getNewPassword());
        userRepository.save(user);

        return new ApiResponse<>(true, "Password updated successfully", toUserResponse(user));
    }

    public RenterDetailResponse getRenterDetailByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        RenterDetailResponse response = RenterDetailResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole().toString())
                .status(user.getStatus().toString())
                .createdAt(user.getCreatedAt())
                .verificationStatus(user.getRenterDetail().getVerificationStatus().toString())
                .isRisky(user.getRenterDetail().getIsRisky())
                // image URLs (client can call these endpoints)
                .cccdFrontUrl("http://localhost:8084/EVRentalSystem/api/users/" + userId + "/renter-detail/cccd-front")
                .cccdBackUrl("http://localhost:8084/EVRentalSystem/api/users/" + userId + "/renter-detail/cccd-back")
                .driverLicenseUrl("http://localhost:8084/EVRentalSystem/api/users/" + userId + "/renter-detail/driver-license")
                .build();

        return response;
    }

    // helper to get raw base64 strings (used by controller image endpoints)
    public Optional<String> getCccdFrontBase64(Integer userId) {
        return renterDetailRepository.findById(userId).map(RenterDetail::getCccdFront);
    }

    public Optional<String> getCccdBackBase64(Integer userId) {
        return renterDetailRepository.findById(userId).map(RenterDetail::getCccdBack);
    }

    public Optional<String> getDriverLicenseBase64(Integer userId) {
        return renterDetailRepository.findById(userId).map(RenterDetail::getDriverLicense);
    }

    private UserResponse toUserResponse(User user) {
        UserResponse dto = new UserResponse();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole().toString());
        dto.setStatus(user.getStatus().toString());
        return dto;
    }

    public User updateUserProfile(Integer userId, UpdateUserProfile req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getFullName() != null && req.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name must not be empty");
        }

        if (req.getPhone() != null && (req.getPhone().length() < 8 || req.getPhone().length() > 20)) {
            throw new IllegalArgumentException("Phone number must be between 8 and 20 digits");
        }

        if (req.getEmail() != null && !req.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (req.getAddress() != null && req.getAddress().length() > 255) {
            throw new IllegalArgumentException("Address too long (max 255 chars)");
        }

        if (req.getFullName() != null) user.setFullName(req.getFullName().trim());
        if (req.getPhone() != null) user.setPhone(req.getPhone().trim());
        if (req.getEmail() != null) user.setEmail(req.getEmail().trim().toLowerCase());
        if (req.getAddress() != null) user.setAddress(req.getAddress().trim());

        return userRepository.save(user);
    }

    public void updateRenterPictures(Integer renterId,
                                     MultipartFile cccdFrontFile,
                                     MultipartFile cccdBackFile,
                                     MultipartFile driverLicenseFile) {

        // 1. Tìm thông tin RenterDetail
        RenterDetail renterDetail = renterDetailRepository.findById(renterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người thuê với ID: " + renterId));

        // 2. Kiểm tra trạng thái VerificationStatus
        // Nếu KHÔNG phải là PENDING thì không cho phép cập nhật -> ném lỗi hoặc return
        if (!RenterDetailVerificationStatusEnum.PENDING.equals(renterDetail.getVerificationStatus())) {
            throw new RuntimeException("Chỉ được phép cập nhật ảnh khi trạng thái xác minh là PENDING (Đang chờ duyệt).");
        }

        // 3. Encode file sang Base64 bằng ImageUtil và cập nhật vào entity
        // Kiểm tra null để tránh lỗi nếu người dùng không gửi đủ 3 file (tùy nghiệp vụ của bạn bắt buộc hay không)

        if (cccdFrontFile != null && !cccdFrontFile.isEmpty()) {
            String base64Front = ImageUtil.encodeToBase64(cccdFrontFile);
            renterDetail.setCccdFront(base64Front);
        }

        if (cccdBackFile != null && !cccdBackFile.isEmpty()) {
            String base64Back = ImageUtil.encodeToBase64(cccdBackFile);
            renterDetail.setCccdBack(base64Back);
        }

        if (driverLicenseFile != null && !driverLicenseFile.isEmpty()) {
            String base64License = ImageUtil.encodeToBase64(driverLicenseFile);
            renterDetail.setDriverLicense(base64License);
        }

        // 4. Lưu xuống database
        renterDetailRepository.save(renterDetail);
    }
}

package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.RenterDetail;
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
        user.setRole("RENTER");
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // save inf renter with base64 images

        RenterDetail detail = new RenterDetail();
        detail.setRenter(savedUser);
        detail.setCccdFront(encodeToBase64(cccdFront));
        detail.setCccdBack(encodeToBase64(cccdBack));
        detail.setDriverLicense(encodeToBase64(gplx));
        detail.setVerificationStatus("PENDING");
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

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email và mật khẩu là bắt buộc!");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với email này!"));

        if (!user.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai mật khẩu!");
        }

        String token = jwtService.generateToken(user.getEmail());

        String cccdFront = null;
        String cccdBack = null;
        String driverLicense = null;
        
        if (user.getRenterDetail() != null) {
            cccdFront = user.getRenterDetail().getCccdFront();
            cccdBack = user.getRenterDetail().getCccdBack();
            driverLicense = user.getRenterDetail().getDriverLicense();
        }

        return new UserLoginResponse(
                user.getUserId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
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
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .verificationStatus(user.getRenterDetail().getVerificationStatus())
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
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
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
}

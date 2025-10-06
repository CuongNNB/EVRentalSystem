package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.repository.UserRepository;
import com.evrental.evrentalsystem.entity.User;
import com.evrental.evrentalsystem.request.*;
import com.evrental.evrentalsystem.response.*;
import com.evrental.evrentalsystem.response.user.UserLoginResponse;
import com.evrental.evrentalsystem.response.user.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserResponse register(UserRegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists!");
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

        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    public UserLoginResponse login(UserLoginRequest request) {
        String input = request.getEmail();
        String password = request.getPassword();

        if (input == null || input.trim().isEmpty()) {
            throw new RuntimeException("Email hoặc username là bắt buộc!");
        }

        // eliminate leading/trailing whitespace
        input = input.trim();

        // Distinguish between email and username
        User user;
        if (input.contains("@")) {
            user = userRepository.findByEmail(input)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này!"));
        } else {
            user = userRepository.findByUsername(input)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với username này!"));
        }

        // check password
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Sai mật khẩu!");
        }

        return new UserLoginResponse(user.getUserId(), user.getUsername(), user.getRole());
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
}

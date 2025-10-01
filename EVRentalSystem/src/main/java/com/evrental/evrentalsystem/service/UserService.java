package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.repository.UserRepository;
import com.evrental.evrentalsystem.repository.RoleRepository;
import com.evrental.evrentalsystem.entity.Role;
import com.evrental.evrentalsystem.entity.User;
import com.evrental.evrentalsystem.request.*;
import com.evrental.evrentalsystem.response.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

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

        Role renterRole = roleRepository.findByRoleName("RENTER")
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(renterRole);

        user.setStatus("ACTIVE");
        user.setCreatedAt(Instant.now());

        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    public UserLoginResponse login(UserLoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found!");
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password!");
        }

        String fakeToken = "token-" + user.getUsername();

        UserLoginResponse res = new UserLoginResponse();
        res.setToken(fakeToken);
        res.setUser(toUserResponse(user));
        return res;
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
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(request.getNewPassword());
        userRepository.save(user);

        return new ApiResponse<>(true, "Password updated successfully", toUserResponse(user));
    }


    private UserResponse toUserResponse(User user) {
        UserResponse dto = new UserResponse();
        dto.setUserId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole() != null ? user.getRole().getRoleName() : null);
        dto.setStatus(user.getStatus());
        return dto;
    }

}

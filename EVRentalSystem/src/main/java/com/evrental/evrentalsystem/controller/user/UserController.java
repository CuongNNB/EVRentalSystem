package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.request.*;
import com.evrental.evrentalsystem.response.*;
import com.evrental.evrentalsystem.response.user.UserLoginResponse;
import com.evrental.evrentalsystem.response.user.UserResponse;
import com.evrental.evrentalsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody UserRegisterRequest request) {
        UserResponse user = userService.register(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Register success", user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserLoginResponse>> login(@RequestBody UserLoginRequest request) {
        UserLoginResponse response = userService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login success", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable("id") Integer id,
                                           @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable("id") Integer id,
                                            @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(userService.changePassword(id, request));
    }
}

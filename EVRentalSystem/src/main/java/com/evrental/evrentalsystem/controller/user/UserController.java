package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.entity.User;
import com.evrental.evrentalsystem.request.*;
import com.evrental.evrentalsystem.response.*;
import com.evrental.evrentalsystem.response.user.RenterDetailResponse;
import com.evrental.evrentalsystem.response.user.UpdateUserProfile;
import com.evrental.evrentalsystem.response.user.UserLoginResponse;
import com.evrental.evrentalsystem.response.user.UserResponse;
import com.evrental.evrentalsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.Iterator;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("password") String password,
            @RequestParam("fullName") String fullName,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam("gplx") MultipartFile gplx,
            @RequestParam("cccdFront") MultipartFile cccdFront,
            @RequestParam("cccdBack") MultipartFile cccdBack
    ) {
        try {
            UserRegisterRequest req = new UserRegisterRequest();
            req.setUsername(username);
            req.setEmail(email);
            req.setPassword(password);
            req.setFullName(fullName);
            req.setPhone(phone);
            req.setAddress(address);

            // Gọi service xử lý và lưu ảnh base64
            UserResponse user = userService.register(req, gplx, cccdFront, cccdBack);

            return ResponseEntity.ok(new ApiResponse<>(true, "Register success", user));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Register failed: " + e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserLoginResponse>> login(@RequestBody UserLoginRequest request) {
        UserLoginResponse response = userService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login success", response));
    }

    //API: http://localhost:8084/EVRentalSystem/api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable("id") Integer id,
                                           @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    //API: http://localhost:8084/EVRentalSystem/api/users/{userId}/password
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable("id") Integer id,
                                            @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(userService.changePassword(id, request));
    }

    //API: http://localhost:8084/EVRentalSystem/api/users/{userId}/renter-detail
    //VD: http://localhost:8084/EVRentalSystem/api/users/1/renter-detail
    @GetMapping("/{userId}/renter-detail")
    public ResponseEntity<?> getRenterDetail(@PathVariable Integer userId) {
        try {
            RenterDetailResponse resp = userService.getRenterDetailByUserId(userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // --- Image endpoints: decode base64 and return bytes with proper Content-Type ---
    @GetMapping("/{userId}/renter-detail/cccd-front")
    public ResponseEntity<byte[]> getCccdFront(@PathVariable Integer userId) {
        return buildImageResponse(userService.getCccdFrontBase64(userId));
    }

    @GetMapping("/{userId}/renter-detail/cccd-back")
    public ResponseEntity<byte[]> getCccdBack(@PathVariable Integer userId) {
        return buildImageResponse(userService.getCccdBackBase64(userId));
    }

    @GetMapping("/{userId}/renter-detail/driver-license")
    public ResponseEntity<byte[]> getDriverLicense(@PathVariable Integer userId) {
        return buildImageResponse(userService.getDriverLicenseBase64(userId));
    }

    // Helper to decode base64 and produce ResponseEntity<byte[]>
    private ResponseEntity<byte[]> buildImageResponse(Optional<String> base64Opt) {
        if (base64Opt.isEmpty() || base64Opt.get().isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        try {
            String base64Raw = base64Opt.get().trim();
            // if stored with data URI prefix like "data:image/png;base64,...."
            String mime = null;
            if (base64Raw.startsWith("data:")) {
                int comma = base64Raw.indexOf(',');
                String meta = base64Raw.substring(5, comma); // image/png;base64
                if (meta.contains(";")) {
                    mime = meta.split(";")[0];
                }
                base64Raw = base64Raw.substring(comma + 1);
            }

            byte[] imageBytes = Base64.getDecoder().decode(base64Raw);

            // If mime unknown, try to detect via ImageIO
            if (mime == null) {
                mime = detectImageMimeType(imageBytes); // e.g. "image/png" or null
            }
            if (mime == null) {
                mime = "application/octet-stream";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(mime));
            headers.setContentLength(imageBytes.length);
            headers.setCacheControl(CacheControl.noCache());

            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            // base64 decode error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Try to detect image format using ImageIO readers
    private String detectImageMimeType(byte[] imageBytes) {
        try (InputStream is = new ByteArrayInputStream(imageBytes);
             ImageInputStream iis = ImageIO.createImageInputStream(is)) {

            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (readers.hasNext()) {
                ImageReader r = readers.next();
                String format = r.getFormatName().toLowerCase(); // e.g. "png", "jpeg"
                switch (format) {
                    case "png": return "image/png";
                    case "jpeg":
                    case "jpg": return "image/jpeg";
                    case "gif": return "image/gif";
                    case "bmp": return "image/bmp";
                    default: return "image/" + format;
                }
            }
        } catch (IOException ignored) {}
        return null;
    }

//API http://localhost:8084/EVRentalSystem/api/users/{userId}/profile
@PutMapping("/{userId}/profile")
public ResponseEntity<UpdateUserProfile> updateProfile(
        @PathVariable Integer userId,
        @RequestBody UpdateUserProfile request) {

    User updated = userService.updateUserProfile(userId, request);

    UpdateUserProfile response = new UpdateUserProfile();
    response.setFullName(updated.getFullName());
    response.setPhone(updated.getPhone());
    response.setEmail(updated.getEmail());
    response.setAddress(updated.getAddress());

    return ResponseEntity.ok(response);
}
}

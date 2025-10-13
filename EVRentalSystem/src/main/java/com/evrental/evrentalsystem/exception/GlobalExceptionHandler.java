package com.evrental.evrentalsystem.exception;

import com.evrental.evrentalsystem.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Arrays;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // 🧩 Bắt lỗi enum hoặc kiểu dữ liệu sai (VD: PartCarName không hợp lệ)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Boolean>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        if (ex.getRequiredType() != null && ex.getRequiredType().isEnum()) {
            // Nếu là enum (như PartCarName)
            String enumName = ex.getRequiredType().getSimpleName();
            Object[] acceptedValues = ex.getRequiredType().getEnumConstants();
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(
                            "Invalid value for " + enumName + ". Accepted values: " +
                                    Arrays.toString(acceptedValues),
                            false
                    )
            );
        }

        // Nếu lỗi không phải enum
        return ResponseEntity.badRequest().body(
                ApiResponse.error("Invalid request parameter type: " + ex.getMessage(), false)
        );
    }

    // 🧩 Bắt các lỗi IllegalArgument (VD: Booking ID không tồn tại, Staff ID không tồn tại)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Boolean>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(ex.getMessage(), false));
    }

    // 🧩 Bắt lỗi chung (server, null pointer, v.v.)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Boolean>> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + ex.getMessage(), false));
    }
}

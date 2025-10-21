package com.evrental.evrentalsystem.controller.user;
import com.evrental.evrentalsystem.request.UserAdditionalFeeRequest;
import com.evrental.evrentalsystem.response.user.UserAdditionalFeeResponse;
import com.evrental.evrentalsystem.service.UserAdditionalFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/additional-fees")
@RequiredArgsConstructor
public class UserAdditionalFeeController {
    private final UserAdditionalFeeService additionalFeeService;
    @PostMapping("/by-booking")
    public ResponseEntity<List<UserAdditionalFeeResponse>> getAdditionalFeesByBookingId(
            @RequestBody UserAdditionalFeeRequest request) {

        List<UserAdditionalFeeResponse> fees =
                additionalFeeService.getAdditionalFeesByBookingId(request.getBookingId());
        return ResponseEntity.ok(fees);
    }
}

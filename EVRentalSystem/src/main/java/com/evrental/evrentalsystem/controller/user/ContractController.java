package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam Integer bookingId, @RequestParam String email) {
        return contractService.sendOtpForContract(bookingId, email);
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam Integer bookingId, @RequestParam String otp) {
        return contractService.verifyOtp(bookingId, otp);
    }
}

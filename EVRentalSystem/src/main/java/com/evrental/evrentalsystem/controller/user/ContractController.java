package com.evrental.evrentalsystem.controller.user;

import com.evrental.evrentalsystem.response.user.ContractItemResponse;
import com.evrental.evrentalsystem.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

     private final ContractService contractService;

     //API: http://localhost:8084/EVRentalSystem/api/contracts/send-otp
    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam Integer bookingId, @RequestParam String email) {
        return contractService.sendOtpForContract(bookingId, email);
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam Integer bookingId, @RequestParam String otp) {
        return contractService.verifyOtp(bookingId, otp);
    }

    @GetMapping
    public List<ContractItemResponse> getContracts(@RequestParam Integer userId) {
        return contractService.getContractsOfUser(userId);
    }
    //API mẫu test "list contract" GET http://localhost:8084/EVRentalSystem/api/contracts?userId=4
    // trả về danh sách hợp đồng của userId = 4
}

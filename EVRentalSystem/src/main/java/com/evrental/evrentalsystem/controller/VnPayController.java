package com.evrental.evrentalsystem.controller;

import com.evrental.evrentalsystem.request.CreatePaymentRequest;
import com.evrental.evrentalsystem.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
public class VnPayController {

    private final VnPayService vnPayService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createPayment(@RequestBody CreatePaymentRequest req, HttpServletRequest httpReq) {
        String clientIp = extractClientIp(httpReq);
        String orderId = (req.getOrderId() != null && !req.getOrderId().isEmpty()) ? req.getOrderId() : UUID.randomUUID().toString();
        String url = vnPayService.createPaymentUrl(req.getAmount(), req.getOrderInfo(), orderId, clientIp, req.getLocale());
        Map<String, String> resp = new HashMap<>();
        resp.put("paymentUrl", url);
        resp.put("orderId", orderId);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/return")
    public ResponseEntity<String> paymentReturn(@RequestParam Map<String, String> allParams) {
        boolean valid = vnPayService.validateSecureHash(allParams);
        if (!valid) {
            return ResponseEntity.badRequest().body("Invalid secure hash");
        }
        String responseCode = allParams.get("vnp_ResponseCode"); // "00" = success
        String txnRef = allParams.get("vnp_TxnRef");
        String amount = allParams.get("vnp_Amount");
        if ("00".equals(responseCode)) {
            // TODO: update order/payment status
            return ResponseEntity.ok("Payment success for order " + txnRef + " amount=" + amount);
        } else {
            return ResponseEntity.ok("Payment failed or cancelled. code=" + responseCode);
        }
    }

    @PostMapping("/ipn")
    public ResponseEntity<String> ipn(@RequestParam Map<String, String> allParams) {
        boolean valid = vnPayService.validateSecureHash(allParams);
        if (!valid) {
            return ResponseEntity.ok("Invalid checksum");
        }
        String responseCode = allParams.get("vnp_ResponseCode");
        String txnRef = allParams.get("vnp_TxnRef");
        // TODO: update DB, ensure idempotency (update only once)
        if ("00".equals(responseCode)) {
            // mark success in DB
        } else {
            // mark failed
        }
        return ResponseEntity.ok("OK");
    }

    private String extractClientIp(HttpServletRequest req) {
        String xf = req.getHeader("X-Forwarded-For");
        if (xf == null) return req.getRemoteAddr();
        return xf.split(",")[0];
    }
}
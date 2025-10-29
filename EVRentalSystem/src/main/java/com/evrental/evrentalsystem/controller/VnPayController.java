package com.evrental.evrentalsystem.controller;

import com.evrental.evrentalsystem.request.CreatePaymentRequest;
import com.evrental.evrentalsystem.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

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
    public RedirectView paymentReturn(@RequestParam Map<String, String> allParams) {
        boolean valid = vnPayService.validateSecureHash(allParams);
        String responseCode = allParams.get("vnp_ResponseCode");
        String txnRef = allParams.get("vnp_TxnRef");
        String amount = allParams.get("vnp_Amount");

        String redirectUrl;

        if (valid && "00".equals(responseCode)) {
            // ✅ Thanh toán thành công
            Integer bookingId = Integer.parseInt(txnRef);
            vnPayService.updateBookingStatus(bookingId);
            redirectUrl = "http://localhost:5173/"; // hoặc trang bạn muốn
            // TODO: cập nhật DB ở đây
        } else {
            // ❌ Thanh toán thất bại
            redirectUrl = "http://localhost:3000/payment-failed";
        }

        RedirectView view = new RedirectView(redirectUrl);
        view.setExposeModelAttributes(false);
        return view;
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
package com.evrental.evrentalsystem.controller.user;
import com.evrental.evrentalsystem.response.PromotionResponse;
import com.evrental.evrentalsystem.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class UserPromotionController {

    private final PromotionService promotionService;
    @GetMapping("/valid")
    public ResponseEntity<List<PromotionResponse>> getValidPromotions() {
        List<PromotionResponse> list = promotionService.getValidPromotions();
        return ResponseEntity.ok(list);
    }
}

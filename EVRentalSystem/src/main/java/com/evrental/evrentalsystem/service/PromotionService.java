package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Promotion;
import com.evrental.evrentalsystem.repository.PromotionRepository;
import com.evrental.evrentalsystem.response.PromotionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository promotionRepository;
    public List<PromotionResponse> getValidPromotions() {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> promotions = promotionRepository.findValidPromotions(now);
        return promotions.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private PromotionResponse mapToDto(Promotion p) {
        return PromotionResponse.builder()
                .promotionId(p.getPromotionId())
                .promoName(p.getPromoName())
                .code(p.getCode())
                .discountPercent(p.getDiscountPercent())
                .startTime(p.getStartTime())
                .endTime(p.getEndTime())
                .status(p.getStatus())
                .build();
    }
}

package com.evrental.evrentalsystem.controller.user;
import com.evrental.evrentalsystem.request.CreateReviewRequest;
import com.evrental.evrentalsystem.response.user.CreateReviewResponse;
import com.evrental.evrentalsystem.service.ReviewService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class UserReviewController {
    private final ReviewService reviewService;

    //API: http://localhost:8084/EVRentalSystem/api/reviews/create-review
    @PostMapping("/create-review")
    public ResponseEntity<?> createReview(@RequestBody CreateReviewRequest request) {
        try {
            CreateReviewResponse dto = reviewService.createReview(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    //API: http://localhost:8084/EVRentalSystem/api/reviews/{modelId}
    @GetMapping("/{modelId}")
    public ResponseEntity<List<CreateReviewResponse>> getReviewsByCarModel(@PathVariable Integer modelId) {
        List<CreateReviewResponse> list = reviewService.getReviewsByCarModelId(modelId);
        return ResponseEntity.ok(list);
    }

    //API: http://localhost:8084/EVRentalSystem/api/reviews/check-exist?bookingId=1
    @GetMapping("/check-exist")
    public ResponseEntity<String> checkExistReview(@RequestParam Integer bookingId) {
        String message = reviewService.checkReviewExist(bookingId);
        return ResponseEntity.ok(message);
    }
}

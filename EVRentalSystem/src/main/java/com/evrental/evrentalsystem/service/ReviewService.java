package com.evrental.evrentalsystem.service;
import com.evrental.evrentalsystem.entity.Booking;
import com.evrental.evrentalsystem.entity.Review;
import com.evrental.evrentalsystem.entity.User;
import com.evrental.evrentalsystem.repository.BookingRepository;
import com.evrental.evrentalsystem.repository.ReviewRepository;
import com.evrental.evrentalsystem.request.CreateReviewRequest;
import com.evrental.evrentalsystem.response.user.CreateReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public CreateReviewResponse createReview(CreateReviewRequest req) {
        Integer bookingId = req.getBookingId();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found: " + bookingId));

        // Kiểm tra nếu booking đã có review (theo unique constraint / business rule)
        if (reviewRepository.existsByBooking_BookingId(bookingId)) {
            throw new IllegalStateException("A review already exists for bookingId: " + bookingId);
        }

        Integer rating = req.getRating();
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .booking(booking)
                .rating(rating)
                .comment(req.getComment())
                // nếu entity Review không set createdAt automatically, set ở đây
                .createdAt(LocalDateTime.now())
                .build();

        try {
            Review saved = reviewRepository.save(review);
            return mapToDto(saved);
        } catch (DataIntegrityViolationException ex) {
            // bảo vệ race condition nếu 2 request cùng lúc tạo review cho cùng booking
            throw new IllegalStateException("Unable to create review (possible duplicate for booking): " + bookingId);
        }
    }

    private CreateReviewResponse mapToDto(Review r) {
        Booking b = r.getBooking();
        User renter = (b != null ? b.getRenter() : null); // tùy booking có getter getRenter()
        return CreateReviewResponse.builder()
                .reviewId(r.getReviewId())
                .bookingId(b != null ? b.getBookingId() : null)
                .renterId(renter != null ? renter.getUserId() : null)
                .renterName(renter != null ? renter.getFullName() : null)
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }

    public List<CreateReviewResponse> getReviewsByCarModelId(Integer modelId) {
        List<Review> reviews = reviewRepository.findByCarModelId(modelId);

        return reviews.stream().map(r -> {
            var booking = r.getBooking();
            var renter = booking != null ? booking.getRenter() : null;

            return CreateReviewResponse.builder()
                    .reviewId(r.getReviewId())
                    .bookingId(booking != null ? booking.getBookingId() : null)
                    .renterId(renter != null ? renter.getUserId() : null)
                    .renterName(renter != null ? renter.getFullName() : null)
                    .rating(r.getRating())
                    .comment(r.getComment())
                    .createdAt(r.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    public String checkReviewExist(Integer bookingId) {
        // Gọi hàm check từ repository
        boolean exists = reviewRepository.existsByBooking_BookingId(bookingId);

        if (exists) {
            return "Review đã tồn tại cho Booking ID: " + bookingId;
        } else {
            return "Chưa có Review nào cho Booking ID: " + bookingId;
        }
    }
}

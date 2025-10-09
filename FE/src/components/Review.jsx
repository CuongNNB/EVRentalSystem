import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const reviews = [
  {
    id: 1,
    name: "Hoàng Minh",
    role: "Doanh nhân",
    rating: 5,
    comment: "Xe mới, sạch sẽ và được sạc đầy. Nhân viên hỗ trợ tận tâm ở mọi bước.",
    avatar: "HM",
    company: "TechCorp Vietnam",
    verified: true
  },
  {
    id: 2,
    name: "Lan Anh",
    role: "Nhân viên văn phòng",
    rating: 5,
    comment: "Thủ tục rất nhanh, đặt xe trên ứng dụng và nhận xe trong 5 phút.",
    avatar: "LA",
    company: "Office Solutions",
    verified: true
  },
  {
    id: 3,
    name: "Quốc Huy",
    role: "Khách du lịch",
    rating: 5,
    comment: "Giá cả rõ ràng, không phát sinh thêm khi trả xe. Rất hài lòng!",
    avatar: "QH",
    company: "Travel Enthusiast",
    verified: true
  },
  {
    id: 4,
    name: "Thu Ngân",
    role: "Content creator",
    rating: 4,
    comment: "Hệ thống trạm sạc phủ khắp. Ứng dụng thông báo rất trực quan.",
    avatar: "TN",
    company: "Digital Media",
    verified: true
  },
  {
    id: 5,
    name: "Trọng Tín",
    role: "Kỹ sư phần mềm",
    rating: 5,
    comment: "Được hướng dẫn lái xe điện chi tiết, cảm giác an toàn và hiện đại.",
    avatar: "TT",
    company: "Software Engineer",
    verified: true
  },
  {
    id: 6,
    name: "Minh Tuấn",
    role: "Sinh viên",
    rating: 5,
    comment: "Dịch vụ tuyệt vời! Xe điện rất êm ái và tiết kiệm chi phí.",
    avatar: "MT",
    company: "University Student",
    verified: true
  },
  {
    id: 7,
    name: "Hương Lan",
    role: "Giáo viên",
    rating: 5,
    comment: "Ứng dụng dễ sử dụng, đặt xe nhanh chóng và thuận tiện.",
    avatar: "HL",
    company: "Education Center",
    verified: true
  },
  {
    id: 8,
    name: "Đức Anh",
    role: "Bác sĩ",
    rating: 4,
    comment: "Xe sạch sẽ, đầy đủ tiện nghi. Hỗ trợ khách hàng rất chuyên nghiệp.",
    avatar: "DA",
    company: "Medical Center",
    verified: true
  }
];

export default function Review() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef(null);

  const totalReviews = reviews.length;
  const visibleCards = window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 3;

  useEffect(() => {
    if (!isAutoPlay || isHovered) return;
    
    const maxIndex = Math.max(0, totalReviews - visibleCards);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, totalReviews, visibleCards]);

  const goToPrevious = () => {
    const maxIndex = Math.max(0, totalReviews - visibleCards);
    setCurrentIndex((prev) => (prev - 1 + maxIndex + 1) % (maxIndex + 1));
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    const maxIndex = Math.max(0, totalReviews - visibleCards);
    setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
    setIsAutoPlay(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  const handleDragEnd = (event, info) => {
    const threshold = 50;
    
    if (info.offset.x > threshold) {
      goToPrevious();
    } else if (info.offset.x < -threshold) {
      goToNext();
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <motion.span
        key={index}
        className={`star ${index < rating ? 'active' : ''}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
      >
        {index < rating ? '★' : '☆'}
      </motion.span>
    ));
  };

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        {/* Header Section */}
        <motion.div 
          className="reviews-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            className="reviews-badge"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ✨ CẢM NHẬN
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Đánh giá khách hàng
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Trải nghiệm được xác nhận bởi cộng đồng người dùng EV Car Rental
          </motion.p>
        </motion.div>
        
        {/* Carousel Section */}
        <div className="reviews-carousel">
          
          {/* Track Container */}
          <div 
            className="reviews-track-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div 
              className="reviews-track" 
              ref={trackRef}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              animate={{ x: -currentIndex * (100 / visibleCards) + "%" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.6
              }}
            >
              {reviews.map((review, index) => {
                const isVisible = index >= currentIndex && index < currentIndex + visibleCards;
                
                return (
                  <motion.div
                    key={review.id}
                    className={`review-card ${isVisible ? 'visible' : ''}`}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ 
                      opacity: isVisible ? 1 : 0.3, 
                      y: 0,
                      scale: isVisible ? 1 : 0.95
                    }}
                    transition={{ 
                      duration: 0.5,
                      delay: (index - currentIndex) * 0.1
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                  >
                    {/* Card Header */}
                    <div className="review-card-header">
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                      {review.verified && (
                        <div className="verified-badge">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Verified
                        </div>
                      )}
      </div>

                    {/* Quote Icon */}
                    <div className="quote-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 21C3 17.4 5.4 15 9 15H13C16.6 15 19 17.4 19 21V22H3V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 3C9 6.31371 11.6863 9 15 9C18.3137 9 21 6.31371 21 3C21 -0.313708 18.3137 -3 15 -3C11.6863 -3 9 -0.313708 9 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
              </div>

                    {/* Review Text */}
                    <motion.p 
                      className="review-text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      "{review.comment}"
                    </motion.p>

                    {/* Author Section */}
                    <motion.div 
                      className="review-author"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div 
                        className="avatar"
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {review.avatar}
                      </motion.div>
                      <div className="author-info">
                <div className="author-name">{review.name}</div>
                <div className="author-role">{review.role}</div>
                        <div className="author-company">{review.company}</div>
              </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
            </div>
          
          {/* Pagination Dots */}
          <motion.div 
            className="carousel-pagination"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {Array.from({ length: Math.ceil(totalReviews / visibleCards) }, (_, index) => (
              <motion.button
                key={index}
                className={`pagination-dot ${index === Math.floor(currentIndex / visibleCards) ? 'active' : ''}`}
                onClick={() => goToSlide(index * visibleCards)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </motion.div>

          {/* Auto-play Control */}
          <motion.div 
            className="carousel-controls"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.button 
              className={`control-btn ${isAutoPlay ? 'active' : ''}`}
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              aria-label={isAutoPlay ? 'Tạm dừng tự động' : 'Bật tự động'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isAutoPlay ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 4H10V20H6V4Z" fill="currentColor"/>
                  <path d="M14 4H18V20H14V4Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

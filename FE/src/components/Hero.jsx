import { useState } from "react";

const stats = [
  { value: "500+", label: "hành trình đã hoàn tất" },
  { value: "50+", label: "mẫu xe điện sẵn sàng" },
  { value: "90%", label: "khách hàng quay lại" },
];

export default function Hero({ backgroundImage }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Đặt xe thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
    }, 2000);
  };
  return (
    <section className="hero-section" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="hero-overlay" />
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-eyebrow">EV Car Rental</span>
          <h1>
            Thuê Xe Điện <span>Lái Tương Lai</span>
          </h1>
          <p>
            Trải nghiệm xe điện thế hệ mới với thủ tục minh bạch, hỗ trợ tận tâm
            và ưu đãi hấp dẫn. Lên lịch nhận xe chỉ trong một phút.
          </p>

          <div className="hero-rating">
            <div className="rating-stars">⭐⭐⭐⭐⭐</div>
            <div className="rating-text">
              <span className="rating-score">4.9/5</span>
              <span className="rating-label">đánh giá từ 2,500+ khách hàng</span>
            </div>
          </div>

          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.value} className="stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <button type="button" className="btn primary-btn hero-cta">
            Xem danh sách xe
          </button>
        </div>

        <div className="hero-card" role="form" aria-label="Đặt xe ngay">
          <div className="hero-card__header">
            <h3>Đặt xe ngay</h3>
            <p>Chọn điểm nhận xe và thời gian phù hợp</p>
          </div>
          <form className="booking-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span className="field-label">
                <span className="field-icon">📍</span>
                Địa điểm nhận xe
              </span>
              <input type="text" placeholder="Ví dụ: EV Station - Quận 1" required />
            </label>
            <label className="form-field">
              <span className="field-label">
                <span className="field-icon">⏰</span>
                Thời gian bắt đầu
              </span>
              <input type="datetime-local" required />
            </label>
            <label className="form-field">
              <span className="field-label">
                <span className="field-icon">⏰</span>
                Thời gian kết thúc
              </span>
              <input type="datetime-local" required />
            </label>
            <button type="submit" className="btn primary-btn booking-submit" disabled={isLoading}>
              <span className="btn-text" style={{display: isLoading ? 'none' : 'block'}}>Đặt ngay</span>
              <span className="btn-loading" style={{display: isLoading ? 'flex' : 'none'}}>
                <span className="spinner"></span>
                Đang xử lý...
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

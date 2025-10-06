import Header from "../components/Header";
import Hero from "../components/Hero";
import Steps from "../components/Steps";
import Reviews from "../components/Review";
import Footer from "../components/Footer";
import { useEffect, useRef } from "react";
import "./Homepage.css";
import heroBg from '../picture/ảnh nền login.png';

const highlights = [
  {
    icon: "⚡",
    title: "Đặt xe linh hoạt",
    description: "Đặt xe theo giờ hoặc theo ngày, hủy miễn phí trước 24 giờ.",
    cta: "Đặt xe ngay",
    ctaLink: "#booking"
  },
  {
    icon: "🛡️",
    title: "Bảo hiểm toàn diện",
    description: "Bao gồm gói bảo hiểm thân vỏ và hỗ trợ cứu hộ 24/7.",
    cta: "Tìm hiểu thêm",
    ctaLink: "#insurance"
  },
  {
    icon: "📱",
    title: "Ứng dụng thông minh",
    description: "Giám sát quãng đường, trạng thái pin và trạm sạc gần nhất.",
    cta: "Tải ứng dụng",
    ctaLink: "#app"
  },
];

export default function Homepage() {
  const highlightRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    highlightRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage">
      <Header />
      <Hero backgroundImage={heroBg} />
      <main>
        <section className="highlights-section" aria-label="Ưu điểm dịch vụ">
          {highlights.map((item, index) => (
            <article 
              key={item.title} 
              className="highlight-card"
              ref={(el) => highlightRefs.current[index] = el}
            >
              <div className="highlight-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button className="highlight-cta" onClick={() => window.location.href = item.ctaLink}>
                {item.cta}
              </button>
            </article>
          ))}
        </section>

        <Steps />
        <Reviews />
        
        {/* Testimonials Section */}
        <section className="testimonials-section">
          <div className="testimonials-header">
            <h2>Khách hàng nói gì về chúng tôi</h2>
            <p>Hơn 2,500+ khách hàng đã tin tưởng và hài lòng với dịch vụ</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p>"Dịch vụ thuê xe điện rất tiện lợi, xe sạch sẽ và dễ lái. Nhân viên hỗ trợ nhiệt tình!"</p>
              <div className="testimonial-author">
                <strong>Nguyễn Minh Anh</strong>
                <span>Khách hàng thân thiết</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p>"Ứng dụng thông minh, theo dõi pin và trạm sạc rất chính xác. Rất hài lòng!"</p>
              <div className="testimonial-author">
                <strong>Trần Văn Hùng</strong>
                <span>Doanh nhân</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p>"Bảo hiểm toàn diện, an tâm khi lái xe. Giá cả hợp lý và minh bạch."</p>
              <div className="testimonial-author">
                <strong>Lê Thị Mai</strong>
                <span>Giáo viên</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="final-cta-section">
          <div className="cta-content">
            <h2>Trải nghiệm xe điện ngay hôm nay</h2>
            <p>Tham gia hàng nghìn khách hàng đã chọn EV Car Rental cho hành trình xanh</p>
            <div className="cta-buttons">
              <button className="btn primary-btn cta-main">Đặt xe ngay</button>
              <button className="btn secondary-btn cta-secondary">Tìm hiểu thêm</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

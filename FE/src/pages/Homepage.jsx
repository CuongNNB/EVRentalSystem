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
    title: "Đặt xe linh hoạt",
    description: "Đặt xe theo giờ hoặc theo ngày, hủy miễn phí trước 24 giờ.",
    cta: "Đặt xe ngay",
  },
  {
    title: "Bảo hiểm toàn diện",
    description: "Bao gồm gói bảo hiểm thân vỏ và hỗ trợ cứu hộ 24/7.",
    cta: "Tìm hiểu thêm",
    ctaLink: "#insurance"
  },
  {
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

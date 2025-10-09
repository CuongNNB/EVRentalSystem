import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RentNowCard from "../components/RentNowCard";
import "./CarDetail.css";

// Mock data - trong thực tế sẽ fetch từ API
const carData = {
  id: 1,
  name: "VinFast VF e34",
  brand: "VinFast",
  price: 850000,
  currency: "VND",
  period: "1 ngày",
  images: [
    "/anhxe/VinFast VF e34.jpg",
    "/anhxe/VinFast VF e34.jpg", 
    "/anhxe/VinFast VF e34.jpg",
    "/anhxe/VinFast VF e34.jpg"
  ],
  specifications: {
    seats: 4,
    transmission: "Số tự động",
    power: "43 HP",
    trunk: "285L",
    range: "210km (NEDC)",
    airbags: 1,
    type: "Minicar",
    limit: "300 km/ngày"
  },
  equipment: [
    "ABS", "Túi khí", "Cruise Control", "Phanh ABS", 
    "Máy lạnh", "Bluetooth", "Camera lùi", "Cảm biến va chạm"
  ],
  description: "VinFast VF e34 là mẫu xe điện hiện đại với thiết kế sang trọng và công nghệ tiên tiến. Xe được trang bị đầy đủ các tính năng an toàn và tiện nghi, phù hợp cho cả gia đình và doanh nhân.",
  features: [
    "Thiết kế hiện đại, sang trọng",
    "Công nghệ điện tiên tiến",
    "An toàn tuyệt đối với hệ thống ABS",
    "Tiết kiệm chi phí vận hành",
    "Bảo hành toàn diện 3 năm"
  ],
  rating: 4.8,
  reviews: 1247
};

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleBookCar = () => {
    navigate(`/contract/${carData.id}`);
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="car-detail-page">
      <Header />
      
      <main className="car-detail-main">
        <div className="car-detail-container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <button onClick={() => navigate('/')} className="breadcrumb-link">Trang chủ</button>
            <span className="breadcrumb-separator">/</span>
            <button onClick={() => navigate('/cars')} className="breadcrumb-link">Xem xe có sẵn</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{carData.name}</span>
          </nav>

          <div className="car-detail-content">
            {/* Left Column - Images */}
            <div className="car-images-section">
              <div className="main-image-container">
                <img 
                  src={carData.images[currentImageIndex]} 
                  alt={carData.name}
                  className="main-image"
                />
                <div className="image-overlay">
                  <div className="image-actions">
                    <button className="image-action-btn" title="Phóng to">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                    </button>
                    <button className="image-action-btn" title="Chia sẻ">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="thumbnail-gallery">
                {carData.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                    onClick={() => handleImageChange(index)}
                  >
                    <img src={image} alt={`${carData.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Car Info */}
            <div className="car-info-section">
              <div className="car-header">
                <div className="car-brand">{carData.brand}</div>
                <h1 className="car-name">{carData.name}</h1>
                <div className="car-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.floor(carData.rating) ? 'filled' : ''}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">{carData.rating}/5 ({carData.reviews} đánh giá)</span>
                </div>
                <div className="car-price">
                  <span className="price-amount">{formatPrice(carData.price)}</span>
                  <span className="price-currency">{carData.currency}</span>
                  <span className="price-period">/ {carData.period}</span>
                </div>
              </div>

              <div className="car-specifications">
                <h3 className="section-title">Thông số kỹ thuật</h3>
                <div className="specs-grid">
                  <div className="spec-item">
                    <div className="spec-icon">👥</div>
                    <div className="spec-content">
                      <span className="spec-value">{carData.specifications.seats}</span>
                      <span className="spec-label">chỗ ngồi</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-icon">⚙️</div>
                    <div className="spec-content">
                      <span className="spec-value">{carData.specifications.transmission}</span>
                      <span className="spec-label">Hộp số</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-icon">⚡</div>
                    <div className="spec-content">
                      <span className="spec-value">{carData.specifications.power}</span>
                      <span className="spec-label">Công suất</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-icon">📦</div>
                    <div className="spec-content">
                      <span className="spec-value">{carData.specifications.trunk}</span>
                      <span className="spec-label">Cốp xe</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-icon">🔋</div>
                    <div className="spec-content">
                      <span className="spec-value">{carData.specifications.range}</span>
                      <span className="spec-label">Tầm hoạt động</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-icon">🛡️</div>
                    <div className="spec-content">
                      <span className="spec-value">{carData.specifications.airbags}</span>
                      <span className="spec-label">Túi khí</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="car-equipment">
                <h3 className="section-title">Trang bị xe</h3>
                <div className="equipment-grid">
                  {carData.equipment.map((item, index) => (
                    <div key={index} className="equipment-item">
                      <span className="equipment-icon">✓</span>
                      <span className="equipment-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="car-features">
                <h3 className="section-title">Tính năng nổi bật</h3>
                <ul className="features-list">
                  {carData.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-icon">✨</span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="car-description">
                <h3 className="section-title">Mô tả</h3>
                <p className="description-text">{carData.description}</p>
              </div>

              <RentNowCard carId={carData.id} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

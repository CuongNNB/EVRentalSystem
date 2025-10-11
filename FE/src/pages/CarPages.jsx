import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RentNowCard from "../components/RentNowCard";
import { carDatabase } from "../data/carData";
import "./CarPages.css";

const filterOptions = [
  { label: "Tất cả xe điện", value: "all" },
  { label: "SUV", value: "SUV" },
  { label: "Sedan", value: "Sedan" },
  { label: "Compact", value: "Compact" },
  { label: "Hạng sang", value: "Luxury" },
  { label: "Hiệu suất cao", value: "Performance" },
];

// Convert carDatabase to the format expected by CarPages
const carInventory = Object.values(carDatabase).map(car => ({
  id: car.id,
  name: car.name,
  subtitle: car.description.substring(0, 50) + "...",
  price: car.price,
  priceDisplay: `${car.price.toLocaleString('vi-VN')} VND/ngày`,
  category: car.specifications.type,
  tags: ["EV", `${car.specifications.seats} chỗ`, car.specifications.transmission],
  image: car.images[0], // Use first image as main image
  features: car.features.slice(0, 4).map(feature => ({
    icon: "🔋",
    label: feature
  })),
}));

function CarCard({ car }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/car/${car.id}`);
  };

  const handleBookNow = () => {
    // Truyền kèm ảnh, tên xe và giá sang trang đặt xe để hiển thị đúng
    navigate(`/booking/${car.id}`, { state: { image: car.image, name: car.name, carId: car.id, price: car.price } });
  };

  return (
    <article className="car-card">
      <div className="car-card__media">
        {car.image ? (
          <img
            src={car.image}
            alt={car.name}
            className="car-card__image"
          />
        ) : (
          <div className="car-card__placeholder">🚗</div>
        )}
      </div>

      <div className="car-card__header">
        <div className="car-card__info">
          <h3 className="car-card__name">{car.name}</h3>
          <p className="car-card__subtitle">{car.subtitle}</p>
        </div>
        <div className="car-card__price-wrapper">
          <span className="car-card__price-label">Từ</span>
          <span className="car-card__price">{car.priceDisplay}</span>
        </div>
      </div>

      <div className="car-card__tags">
        {car.tags.map((tag, index) => (
          <span key={index} className="car-card__tag">
            {tag}
          </span>
        ))}
      </div>

      <ul className="car-card__features">
        {car.features.map((feature, index) => (
          <li key={index} className="car-card__feature">
            <span className="car-card__feature-icon">{feature.icon}</span>
            <span className="car-card__feature-text">{feature.label}</span>
          </li>
        ))}
      </ul>

      <div className="car-card__actions">
        <button
          className="car-card__cta car-card__cta--secondary"
          onClick={handleViewDetails}
        >
          Xem chi tiết
        </button>
        <button className="car-card__cta" onClick={handleBookNow}>
          Thuê ngay
        </button>
      </div>
    </article>
  );
}

export default function CarPages() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCars = useMemo(() => {
    if (activeFilter === "all") {
      return carInventory;
    }
    return carInventory.filter(car => car.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="car-page">
      <Header />
      <main className="car-page__main">
        <div className="car-page__intro">
          <span className="car-page__badge">XEM XE CÓ SẴN</span>
          <h1 className="car-page__title">Khám phá xe điện</h1>
          <p className="car-page__description">
            Tìm kiếm xe điện phù hợp với nhu cầu của bạn từ bộ sưu tập đa dạng của chúng tôi
          </p>
        </div>

        <div className="car-filters">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`car-filters__button ${
                activeFilter === option.value ? "is-active" : ""
              }`}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filteredCars.length === 0 ? (
          <div className="car-grid__empty">
            <p>Không tìm thấy xe nào phù hợp với bộ lọc đã chọn.</p>
          </div>
        ) : (
          <div className="car-grid">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
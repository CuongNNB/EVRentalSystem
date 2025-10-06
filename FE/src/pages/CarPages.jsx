import { useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CarPages.css";

const filterOptions = [
  { label: "Tất cả xe điện", value: "all" },
  { label: "SUV", value: "SUV" },
  { label: "Compact", value: "Compact" },
  { label: "Sedan", value: "Sedan" },
];

const carInventory = [
  {
    id: "vf8-plus",
    name: "VinFast VF 8 Plus",
    subtitle: "Phiên bản pin nâng cao, động cơ kép",
    price: "2.200.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "AWD"],
    image:
      "https://images.vinfastauto.com/Uploads/Can_Tho/Fast_Cargreen_Tram/suv-vf-8-2023-front.jpg",
    features: [
      { icon: "🔋", label: "Quãng đường 471 km" },
      { icon: "⚡", label: "Sạc nhanh 30 phút" },
      { icon: "🛡️", label: "ADAS cấp độ 2" },
      { icon: "❄️", label: "Điều hòa 2 vùng" },
    ],
  },
  {
    id: "ioniq5",
    name: "Hyundai Ioniq 5",
    subtitle: "Thiết kế tương lai, nội thất rộng rãi",
    price: "1.950.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "Tự động"],
    image:
      "https://global.hyundai.com/static/images/model/ioniq5/highlights/design/pc/main-key-visual-desktop.jpg",
    features: [
      { icon: "🔋", label: "Pin 77 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 507 km" },
      { icon: "🧳", label: "Khoang chứa 527L" },
      { icon: "🌡️", label: "Ghế sưởi & làm mát" },
    ],
  },
  {
    id: "kia-ev6",
    name: "Kia EV6 GT-Line",
    subtitle: "SUV coupe hiệu suất cao, sạc siêu nhanh",
    price: "2.050.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "AWD"],
    image:
      "https://www.kia.com/content/dam/kwcms/kme/uk/en/assets/contents/vehicles/ev6/2023/03/ev6-gt-line-snow-white-pearl.png",
    features: [
      { icon: "⚡", label: "Sạc 10-80% trong 18 phút" },
      { icon: "🔋", label: "Pin 77.4 kWh" },
      { icon: "🧠", label: "Highway Drive Assist 2" },
      { icon: "🛋️", label: "Nội thất da Eco" },
    ],
  },
  {
    id: "model3",
    name: "Tesla Model 3",
    subtitle: "Hiệu suất mạnh mẽ, Autopilot thông minh",
    price: "2.400.000 VND/ngày",
    category: "Sedan",
    tags: ["EV", "4 chỗ", "Autopilot"],
    image:
      "https://tesla-cdn.thron.com/delivery/public/image/tesla/20d0bb0d-ae50-435f-8ed0-cc85ee5110e1/bvlatuR/std/2880x1800/Desktop-Model3",
    features: [
      { icon: "⚡", label: "0-100 km/h 4.4s" },
      { icon: "🧭", label: "Tự động giữ làn" },
      { icon: "🔈", label: "Âm thanh Premium" },
      { icon: "🛡️", label: "5 sao ANCAP" },
    ],
  },
  {
    id: "vf5",
    name: "VinFast VF 5 Plus",
    subtitle: "Cỡ nhỏ linh hoạt, di chuyển nội đô",
    price: "990.000 VND/ngày",
    category: "Compact",
    tags: ["EV", "5 chỗ", "Tự động"],
    image: "",
    features: [
      { icon: "🛣️", label: "Tầm hoạt động 300 km" },
      { icon: "🅿️", label: "Hỗ trợ đỗ xe" },
      { icon: "📱", label: "Kết nối ứng dụng" },
      { icon: "💺", label: "Ghế nỉ cao cấp" },
    ],
  },
  {
    id: "vfe34",
    name: "VinFast VF e34",
    subtitle: "Crossover điện thông minh, trợ lý giọng nói",
    price: "1.200.000 VND/ngày",
    category: "Compact",
    tags: ["EV", "5 chỗ", "FWD"],
    image: "https://storage.googleapis.com/vinfast-data-01/VFe34-Exterior-1.png",
    features: [
      { icon: "🛣️", label: "Tầm hoạt động 318 km" },
      { icon: "🗣️", label: "Trợ lý giọng nói ViVi" },
      { icon: "📱", label: "Ứng dụng VinFast" },
      { icon: "🛡️", label: "ADAS cấp độ 2" },
    ],
  },
  {
    id: "byd-dolphin",
    name: "BYD Dolphin Premium",
    subtitle: "Hatchback điện trẻ trung, tiện nghi",
    price: "1.050.000 VND/ngày",
    category: "Compact",
    tags: ["EV", "5 chỗ", "Tự động"],
    image: "https://byd.com.vn/wp-content/uploads/2023/07/BYD_Dolphin_Grey.png",
    features: [
      { icon: "🔋", label: "Pin Blade 60 kWh" },
      { icon: "⚡", label: "Sạc nhanh DC 30 phút" },
      { icon: "🎨", label: "Khoang nội thất 2 tông màu" },
      { icon: "🛋️", label: "Ghế chỉnh điện 6 hướng" },
    ],
  },
  {
    id: "mercedes-eqe",
    name: "Mercedes-Benz EQE 350+",
    subtitle: "Sedan hạng sang, tiện nghi chuẩn S-Class",
    price: "2.850.000 VND/ngày",
    category: "Sedan",
    tags: ["EV", "5 chỗ", "Hạng sang"],
    image:
      "https://www.mercedes-benz.ie/passengercars/mercedes-benz-cars/models/eqe/saloon-v295/exterior-design/_jcr_content/root/slider/sliderchilditems/slideritem/image/MQ6-12-image-20220322152708/01-mercedes-eqe-v295-exterior-3400x1915-03-2022.png",
    features: [
      { icon: "🛋️", label: "Ghế massage Energizing" },
      { icon: "🎵", label: "Âm thanh Burmester 3D" },
      { icon: "🔋", label: "Pin 90,6 kWh" },
      { icon: "🧠", label: "Driving Assistance Plus" },
    ],
  },
  {
    id: "audi-q8-etron",
    name: "Audi Q8 e-tron",
    subtitle: "SUV sang trọng, quattro toàn thời gian",
    price: "2.950.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "Quattro"],
    image:
      "https://www.audi-mediacenter.com//system/production/media/83919/images/7ba0291ea3c546f8fb8dfccffed0f799fb484a4c/A221780_blog.jpg",
    features: [
      { icon: "⚡", label: "Sạc DC 170 kW" },
      { icon: "🛣️", label: "Quattro AWD" },
      { icon: "🖥️", label: "MMI cảm ứng kép" },
      { icon: "❄️", label: "Điều hòa 4 vùng" },
    ],
  },
];

function CarCard({ car }) {
  return (
    <article className="car-card">
      <div className="car-card__media">
        {car.image ? (
          <img
            src={car.image}
            alt={car.name}
            className="car-card__image"
            loading="lazy"
          />
        ) : (
          <div className="car-card__placeholder" aria-hidden="true">
            🚗
          </div>
        )}
        {car.tags.includes("EV") && <span className="car-card__badge">EV Ready</span>}
      </div>

      <div className="car-card__header">
        <div>
          <h3 className="car-card__name">{car.name}</h3>
          <p className="car-card__subtitle">{car.subtitle}</p>
        </div>
        <div className="car-card__price-wrapper">
          <span className="car-card__price-label">Giá từ</span>
          <p className="car-card__price">{car.price}</p>
        </div>
      </div>

      <div className="car-card__tags">
        {car.tags.map((tag) => (
          <span key={tag} className="car-card__tag">
            {tag}
          </span>
        ))}
      </div>

      <ul className="car-card__features">
        {car.features.map((feature) => (
          <li key={feature.label} className="car-card__feature">
            <span className="car-card__feature-icon" aria-hidden="true">
              {feature.icon}
            </span>
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      <button type="button" className="car-card__cta">
        Đặt ngay <span aria-hidden>→</span>
      </button>
    </article>
  );
}

export default function CarPages() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCars = useMemo(() => {
    if (activeFilter === "all") {
      return carInventory;
    }
    return carInventory.filter((car) => car.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="car-page">
      <Header />
      <main className="car-page__main">
        <section className="car-page__intro" aria-labelledby="car-page-title">
          <span className="car-page__badge">Xe điện có sẵn</span>
          <h1 id="car-page-title" className="car-page__title">
            Chọn chiếc xe điện hoàn hảo cho hành trình của bạn
          </h1>
          <p className="car-page__description">
            Bộ sưu tập 100% xe điện được kiểm tra định kỳ, tích hợp bảo hiểm và hỗ trợ sạc 24/7. Lọc nhanh theo nhu cầu của bạn và đặt xe chỉ với vài cú bấm.
          </p>

          <div className="car-filters" role="tablist" aria-label="Lọc phân khúc xe điện">
            {filterOptions.map((option) => {
              const isActive = option.value === activeFilter;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`car-filters__button${isActive ? " is-active" : ""}`}
                  onClick={() => setActiveFilter(option.value)}
                  aria-pressed={isActive}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-live="polite" aria-label="Danh sách xe điện sẵn sàng">
          <div className="car-grid">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          {filteredCars.length === 0 && (
            <div className="car-grid__empty">
              Hiện chưa có mẫu xe điện nào trong phân khúc này. Vui lòng chọn bộ lọc khác hoặc liên hệ hotline 1800 6868 để được hỗ trợ.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

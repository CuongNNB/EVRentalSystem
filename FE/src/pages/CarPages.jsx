import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RentNowCard from "../components/RentNowCard";
import "./CarPages.css";

const filterOptions = [
  { label: "Tất cả xe điện", value: "all" },
  { label: "SUV", value: "SUV" },
  { label: "Sedan", value: "Sedan" },
  { label: "Compact", value: "Compact" },
  { label: "Hạng sang", value: "Luxury" },
  { label: "Hiệu suất cao", value: "Performance" },
];

const carInventory = [
  {
    id: "vf8-plus",
    name: "VinFast VF 8 Plus",
    subtitle: "Phiên bản pin nâng cao, động cơ kép",
    price: "2.200.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "AWD"],
    image: "/src/anhxe/VinFast VF 8 Plus.jpg",
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
    image: "/src/anhxe/Hyundai Ioniq 5.jpg",
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
    image: "/src/anhxe/Kia EV6 GT-Line.jpg",
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
    image: "/src/anhxe/Tesla Model 3.jpg",
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
    image: "/src/anhxe/VinFast VF 5 Plus.jpg",
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
    image: "/src/anhxe/VinFast VF e34.jpg",
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
    image: "/src/anhxe/BYD Dolphin Premium.jpg",
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
    image: "/src/anhxe/Mercedes-Benz EQE 350+.jpg",
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
    image: "/src/anhxe/Audi Q8 e-tron.jpg",
    features: [
      { icon: "⚡", label: "Sạc DC 170 kW" },
      { icon: "🛣️", label: "Quattro AWD" },
      { icon: "🖥️", label: "MMI cảm ứng kép" },
      { icon: "❄️", label: "Điều hòa 4 vùng" },
    ],
  },
  // Thêm xe điện mới
  {
    id: "tesla-model-y",
    name: "Tesla Model Y",
    subtitle: "SUV điện phổ biến nhất thế giới",
    price: "2.600.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "7 chỗ", "Autopilot"],
    image: "/src/anhxe/Tesla Model Y.jpg",
    features: [
      { icon: "🚀", label: "0-100 km/h 3.7s" },
      { icon: "🧭", label: "Full Self-Driving" },
      { icon: "🔋", label: "Tầm hoạt động 565 km" },
      { icon: "🛡️", label: "An toàn 5 sao" },
    ],
  },
  {
    id: "bmw-ix",
    name: "BMW iX xDrive50",
    subtitle: "SUV điện sang trọng, công nghệ tiên tiến",
    price: "3.200.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "xDrive"],
    image: "/src/anhxe/BMW iX xDrive50.jpg",
    features: [
      { icon: "🔋", label: "Pin 111.5 kWh" },
      { icon: "⚡", label: "Sạc 10-80% 31 phút" },
      { icon: "🖥️", label: "iDrive 8.0" },
      { icon: "🎵", label: "Âm thanh Bowers & Wilkins" },
    ],
  },
  {
    id: "porsche-taycan",
    name: "Porsche Taycan Turbo S",
    subtitle: "Sedan điện hiệu suất cao, thiết kế thể thao",
    price: "4.500.000 VND/ngày",
    category: "Sedan",
    tags: ["EV", "4 chỗ", "Turbo"],
    image: "/src/anhxe/Porsche Taycan Turbo S.jpg",
    features: [
      { icon: "🚀", label: "0-100 km/h 2.8s" },
      { icon: "⚡", label: "Công suất 560 kW" },
      { icon: "🔋", label: "Tầm hoạt động 412 km" },
      { icon: "🏁", label: "Chế độ Track" },
    ],
  },
  {
    id: "volkswagen-id4",
    name: "Volkswagen ID.4 Pro",
    subtitle: "SUV điện gia đình, thiết kế hiện đại",
    price: "1.800.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "MEB"],
    image: "/src/anhxe/Volkswagen ID.4 Pro.jpg",
    features: [
      { icon: "🔋", label: "Pin 77 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 520 km" },
      { icon: "📱", label: "ID. Light" },
      { icon: "🛡️", label: "IQ.DRIVE" },
    ],
  },
  {
    id: "nissan-leaf",
    name: "Nissan Leaf e+",
    subtitle: "Hatchback điện tiên phong, đã được chứng minh",
    price: "1.100.000 VND/ngày",
    category: "Compact",
    tags: ["EV", "5 chỗ", "e-Pedal"],
    image: "/src/anhxe/Nissan Leaf e+.jpg",
    features: [
      { icon: "🔋", label: "Pin 62 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 385 km" },
      { icon: "🦶", label: "e-Pedal" },
      { icon: "🛡️", label: "ProPILOT" },
    ],
  },
  {
    id: "ford-mustang-mach-e",
    name: "Ford Mustang Mach-E GT",
    subtitle: "SUV điện Mustang, hiệu suất mạnh mẽ",
    price: "2.300.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "GT"],
    image: "/src/anhxe/Ford Mustang Mach-E GT.jpg",
    features: [
      { icon: "🚀", label: "0-100 km/h 3.7s" },
      { icon: "🔋", label: "Pin 88 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 402 km" },
      { icon: "🎵", label: "B&O Sound System" },
    ],
  },
  {
    id: "polestar-2",
    name: "Polestar 2 Performance",
    subtitle: "Sedan điện cao cấp, thiết kế Bắc Âu",
    price: "2.800.000 VND/ngày",
    category: "Sedan",
    tags: ["EV", "5 chỗ", "Performance"],
    image: "/src/anhxe/Polestar 2 Performance.jpg",
    features: [
      { icon: "⚡", label: "Công suất 300 kW" },
      { icon: "🔋", label: "Pin 78 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 470 km" },
      { icon: "🖥️", label: "Android Automotive" },
    ],
  },
  {
    id: "rivian-r1t",
    name: "Rivian R1T Adventure",
    subtitle: "Pickup điện đầu tiên, khả năng off-road",
    price: "3.800.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "Adventure"],
    image: "/src/anhxe/Rivian R1T Adventure.jpg",
    features: [
      { icon: "🔋", label: "Pin 135 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 505 km" },
      { icon: "🏔️", label: "Khả năng off-road" },
      { icon: "🛠️", label: "Gear Tunnel" },
    ],
  },
  {
    id: "lucid-air",
    name: "Lucid Air Dream Range",
    subtitle: "Sedan điện tầm xa, nội thất sang trọng",
    price: "4.200.000 VND/ngày",
    category: "Sedan",
    tags: ["EV", "5 chỗ", "Luxury"],
    image: "/src/anhxe/Lucid Air Dream Range.jpg",
    features: [
      { icon: "🔋", label: "Pin 112 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 832 km" },
      { icon: "🛋️", label: "Nội thất da cao cấp" },
      { icon: "🎵", label: "Surreal Sound" },
    ],
  },
  {
    id: "hyundai-ioniq-6",
    name: "Hyundai Ioniq 6",
    subtitle: "Sedan điện tương lai, hiệu suất khí động học",
    price: "2.100.000 VND/ngày",
    category: "Sedan",
    tags: ["EV", "5 chỗ", "Aerodynamic"],
    image: "/src/anhxe/Hyundai Ioniq 6.jpg",
    features: [
      { icon: "🔋", label: "Pin 77.4 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 610 km" },
      { icon: "🌪️", label: "Hệ số cản 0.21" },
      { icon: "🖥️", label: "Cockpit 12.3 inch" },
    ],
  },
  {
    id: "kia-ev9",
    name: "Kia EV9 GT-Line",
    subtitle: "SUV điện 7 chỗ, thiết kế bold",
    price: "2.700.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "7 chỗ", "GT-Line"],
    image: "/src/anhxe/Kia EV9 GT-Line.jpg",
    features: [
      { icon: "🔋", label: "Pin 99.8 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 541 km" },
      { icon: "🪑", label: "Ghế xoay 180°" },
      { icon: "🛡️", label: "ADAS cấp độ 3" },
    ],
  },
  {
    id: "genesis-gv60",
    name: "Genesis GV60 Performance",
    subtitle: "SUV điện hạng sang, thiết kế độc đáo",
    price: "2.400.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "Luxury"],
    image: "/src/anhxe/Genesis GV60 Performance.jpg",
    features: [
      { icon: "🔋", label: "Pin 77.4 kWh" },
      { icon: "⚡", label: "Công suất 320 kW" },
      { icon: "🛣️", label: "Tầm hoạt động 451 km" },
      { icon: "💎", label: "Crystal Sphere" },
    ],
  },
  {
    id: "volvo-xc40-recharge",
    name: "Volvo XC40 Recharge",
    subtitle: "SUV điện an toàn, thiết kế Bắc Âu",
    price: "1.900.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "Safety"],
    image: "/src/anhxe/Volvo XC40 Recharge.jpg",
    features: [
      { icon: "🔋", label: "Pin 78 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 418 km" },
      { icon: "🛡️", label: "City Safety" },
      { icon: "🌿", label: "Nội thất tái chế" },
    ],
  },
  {
    id: "mazda-mx-30",
    name: "Mazda MX-30",
    subtitle: "Crossover điện nhỏ gọn, thiết kế độc đáo",
    price: "1.300.000 VND/ngày",
    category: "Compact",
    tags: ["EV", "4 chỗ", "Kodo"],
    image: "/src/anhxe/Mazda MX-30.jpg",
    features: [
      { icon: "🔋", label: "Pin 35.5 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 200 km" },
      { icon: "🚪", label: "Cửa ngược" },
      { icon: "🌿", label: "Nội thất Cork" },
    ],
  },
  {
    id: "mini-cooper-se",
    name: "MINI Cooper SE",
    subtitle: "Hatchback điện nhỏ gọn, vui nhộn",
    price: "1.150.000 VND/ngày",
    category: "Compact",
    tags: ["EV", "4 chỗ", "Fun"],
    image: "/src/anhxe/MINI Cooper SE.jpg",
    features: [
      { icon: "🔋", label: "Pin 32.6 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 233 km" },
      { icon: "🎨", label: "Thiết kế cá nhân hóa" },
      { icon: "🎵", label: "Âm thanh Harman Kardon" },
    ],
  },
  {
    id: "fiat-500e",
    name: "Fiat 500e",
    subtitle: "Hatchback điện Ý, thiết kế retro",
    price: "1.000.000 VND/ngày",
    category: "Compact",
    tags: ["EV", "4 chỗ", "Retro"],
    image: "/src/anhxe/Fiat 500e.jpg",
    features: [
      { icon: "🔋", label: "Pin 42 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 320 km" },
      { icon: "🎨", label: "50 màu sắc" },
      { icon: "🌿", label: "Nội thất tái chế" },
    ],
  },
  // Thêm 3 xe cuối cùng
  {
    id: "tesla-model-s",
    name: "Tesla Model S Plaid",
    subtitle: "Sedan điện hiệu suất cao nhất, 0-100km/h 2.1s",
    price: "3.500.000 VND/ngày",
    category: "Sedan",
    tags: ["EV", "5 chỗ", "Plaid"],
    image: "/src/anhxe/Tesla Model S Plaid.jpg",
    features: [
      { icon: "🚀", label: "0-100 km/h 2.1s" },
      { icon: "🔋", label: "Tầm hoạt động 628 km" },
      { icon: "🧭", label: "Full Self-Driving" },
      { icon: "🎮", label: "Gaming System" },
    ],
  },
  {
    id: "jaguar-i-pace",
    name: "Jaguar I-PACE",
    subtitle: "SUV điện sang trọng Anh, thiết kế thể thao",
    price: "2.500.000 VND/ngày",
    category: "SUV",
    tags: ["EV", "5 chỗ", "Luxury"],
    image: "/src/anhxe/Jaguar I-PACE.jpg",
    features: [
      { icon: "🔋", label: "Pin 90 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 470 km" },
      { icon: "🛋️", label: "Nội thất da cao cấp" },
      { icon: "🎵", label: "Âm thanh Meridian" },
    ],
  },
  {
    id: "smart-eq-fortwo",
    name: "smart EQ fortwo",
    subtitle: "Xe điện đô thị nhỏ gọn, dễ đỗ xe",
    price: "850.000 VND/ngày",
    category: "Compact",
    tags: ["EV", "2 chỗ", "Urban"],
    image: "/src/anhxe/smart EQ fortwo.jpg",
    features: [
      { icon: "🔋", label: "Pin 17.6 kWh" },
      { icon: "🛣️", label: "Tầm hoạt động 159 km" },
      { icon: "🅿️", label: "Dễ đỗ xe" },
      { icon: "🌱", label: "Thân thiện môi trường" },
    ],
  },
];

function CarCard({ car }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/car/${car.id}`);
  };

  const handleBookNow = () => {
    navigate(`/booking/${car.id}`);
  };

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

      <div className="car-card__actions">
        <button 
          type="button" 
          className="car-card__cta car-card__cta--secondary"
          onClick={handleViewDetails}
        >
          Xem chi tiết <span aria-hidden>👁️</span>
        </button>
        <button 
          type="button" 
          className="car-card__cta"
          onClick={handleBookNow}
        >
          Đặt ngay <span aria-hidden>→</span>
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
    if (activeFilter === "Luxury") {
      return carInventory.filter((car) => 
        car.tags.includes("Luxury") || 
        car.tags.includes("Hạng sang") ||
        car.price.includes("3.") || 
        car.price.includes("4.")
      );
    }
    if (activeFilter === "Performance") {
      return carInventory.filter((car) => 
        car.tags.includes("Performance") || 
        car.tags.includes("Turbo") ||
        car.tags.includes("GT") ||
        car.tags.includes("GT-Line")
      );
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

        <RentNowCard />
        
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

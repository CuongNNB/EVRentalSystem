import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RentNowCard from "../components/RentNowCard";
import "./CarPages.css";

const filterOptions = [
    { label: "Tất cả xe điện", value: "all" },
    { label: "VinFast", value: "VinFast" },
    { label: "Hyundai", value: "Hyundai" },
    { label: "Tesla", value: "Tesla" },
    { label: "Kia", value: "Kia" },
    { label: "BMW", value: "BMW" },
];

// 🧮 Hàm format giá (vd: 1200 → 1.200.000 VND/ngày) s
const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    const formatted = (price * 1000).toLocaleString("vi-VN");
    return `${formatted} VND/ngày`;
};

function CarCard({ car }) {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/car/${car.id}`, {
            state: {
                ...car,
                stationId: car.stationId || 1, // fallback nếu backend chưa có id
                stationName: car.stationName || "Không rõ trạm",
                images: [car.picture ? `/carpic/${car.picture}` : "/anhxe/default.jpg"],
            },
        });
    };


    const handleBookNow = () => {
        navigate(`/booking/${car.id}`, {
            state: {
                id: car.id,
                name: `${car.brand} ${car.model}`,
                price: car.price,
                images: [car.picture ? `/carpic/${car.picture}` : "/anhxe/default.jpg"],
                stationId: car.stationId || 1, // fallback nếu backend chưa có
                stationName: car.stationName || "Không rõ trạm",
            },
        });
    };

    return (
        <article className="car-card">
            <div className="car-card__media">
                {car.picture ? (
                    <img
                        src={`/carpic/${car.picture}`}
                        alt={car.model}
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
                    <h3 className="car-card__name">{car.model}</h3>
                    <p className="car-card__subtitle">
                        {car.brand} – {car.color}
                    </p>
                </div>
                <div className="car-card__price-wrapper">
                    <span className="car-card__price-label">Giá thuê</span>
                    <p className="car-card__price">{formatPrice(car.price)}</p>
                </div>
            </div>

            <div className="car-card__tags">
                <span className="car-card__tag">⚡ {car.batteryCapacity}</span>
                <span className="car-card__tag">{car.status}</span>
            </div>

            <ul className="car-card__features">
                <li className="car-card__feature">
                    <span>{car.stationName}</span>
                </li>

            </ul>

            <div className="car-card__actions">
                <button
                    type="button"
                    className="car-card__cta car-card__cta--secondary"
                    onClick={handleViewDetails}
                >
                    Xem chi tiết <span aria-hidden></span>
                </button>

            </div>
        </article>
    );
}

export default function CarPages() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [cars, setCars] = useState([]);

    // 🔄 Gọi API BE
    useEffect(() => {
        fetch("http://localhost:8084/EVRentalSystem/api/vehicles/available")
            .then((res) => res.json())
            .then((data) => setCars(data))
            .catch((err) => console.error("Lỗi khi lấy danh sách xe:", err));
    }, []);

    // 🧩 Lọc theo hãng xe
    const filteredCars = useMemo(() => {
        if (activeFilter === "all") return cars;
        return cars.filter(
            (car) =>
                car.brand &&
                car.brand.toLowerCase().includes(activeFilter.toLowerCase())
        );
    }, [cars, activeFilter]);

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
                        Bộ sưu tập 100% xe điện được kiểm tra định kỳ, tích hợp bảo hiểm và hỗ trợ sạc 24/7. Lọc nhanh theo hãng xe bạn yêu thích và đặt ngay.
                    </p>
                    <h4>Chọn loại xe bạn thích</h4>
                    <div
                        className="car-filters"
                        role="tablist"
                        aria-label="Lọc theo hãng xe điện"
                    >
                        {filterOptions.map((option) => {
                            const isActive = option.value === activeFilter;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`car-filters__button${
                                        isActive ? " is-active" : ""
                                    }`}
                                    onClick={() => setActiveFilter(option.value)}
                                    aria-pressed={isActive}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* <RentNowCard /> */}

                <section aria-live="polite" aria-label="Danh sách xe điện sẵn sàng">
                    <div className="car-grid">
                        {filteredCars.map((car) => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                    {filteredCars.length === 0 && (
                        <div className="car-grid__empty">
                            Hiện chưa có mẫu xe của hãng này. Vui lòng chọn bộ lọc khác hoặc
                            liên hệ hotline 1800 6868 để được hỗ trợ.
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}

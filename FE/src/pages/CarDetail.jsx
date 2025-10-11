import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CarDetail.css";

export default function CarDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [carData, setCarData] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    // Tự động đổi ảnh mỗi 5 giây (fade mượt)
    useEffect(() => {
        if (!carData?.images || carData.images.length === 0) return;
        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setCurrentImageIndex((prev) =>
                    prev === carData.images.length - 1 ? 0 : prev + 1
                );
                setIsFading(false);
            }, 500);
        }, 5000);
        return () => clearInterval(interval);
    }, [carData, currentImageIndex]);

    // Fetch chi tiết xe từ API backend
    useEffect(() => {
        const fetchCarDetail = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8084/EVRentalSystem/api/vehicles/${id}`
                );
                if (!res.ok) throw new Error("Không thể tải dữ liệu xe");
                const data = await res.json();

                const imagePath = data.picture
                    ? `/carpic/${data.picture}`
                    : "/anhxe/default.jpg";

                const mappedCar = {
                    id: data.id,
                    name: data.model ? `${data.brand} ${data.model}` : data.brand,
                    brand: data.brand,
                    price: data.price || 0,
                    currency: "VND",
                    period: "1 ngày",
                    images: [imagePath, imagePath, imagePath, imagePath],
                    description:
                        data.description ||
                        "Một lựa chọn tuyệt vời cho hành trình an toàn, tiết kiệm và thân thiện với môi trường. Xe được bảo dưỡng định kỳ và luôn trong tình trạng tốt nhất.",
                    specifications: {
                        seats: data.seats ?? 5,
                        transmission: "Số tự động",
                        power: data.batteryCapacity ?? "Không xác định",
                        range: "210 km (ước lượng)",
                        airbags: 2,
                        type: data.status ?? "Đang hoạt động",
                        chargeTime: "Khoảng 45 phút (sạc nhanh)",
                        costPerKm: "Khoảng 400₫/km",
                    },
                    equipment: [
                        "ABS", "Cruise Control", "Camera lùi", "Bluetooth", "Cảm biến va chạm"
                    ],
                    features: [
                        "Thiết kế hiện đại",
                        "Công nghệ tiên tiến",
                        "An toàn tối đa",
                        "Tiết kiệm năng lượng",
                        "Trải nghiệm lái êm ái"
                    ],
                };

                setCarData(mappedCar);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu xe:", err);
            }
        };

        fetchCarDetail();
    }, [id]);

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN").format(price * 1000);

    const handleBookCar = () => {
        if (!carData) return;
        navigate(`/booking/${carData.id}`, { state: carData });
    };

    if (!carData) return null;

    return (
        <div className="car-detail-page">
            <Header />
            <main className="car-detail-main">
                <div className="car-detail-container">
                    <nav className="breadcrumb">
                        <button onClick={() => navigate("/")} className="breadcrumb-link">
                            Trang chủ
                        </button>
                        <span className="breadcrumb-separator">/</span>
                        <button
                            onClick={() => navigate("/cars")}
                            className="breadcrumb-link"
                        >
                            Xem xe có sẵn
                        </button>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-current">{carData.name}</span>
                    </nav>

                    <div className="car-detail-content">
                        {/* Cột trái - hình ảnh */}
                        <div className="car-images-section">
                            <div className="main-image-container">
                                <img
                                    src={carData.images[currentImageIndex]}
                                    alt={carData.name}
                                    className={`main-image ${isFading ? "fade-out" : ""}`}
                                />
                            </div>

                            <div className="thumbnail-gallery">
                                {carData.images.map((image, i) => (
                                    <button
                                        key={i}
                                        className={`thumbnail ${
                                            currentImageIndex === i ? "active" : ""
                                        }`}
                                        onClick={() => setCurrentImageIndex(i)}
                                    >
                                        <img src={image} alt={`${carData.name} ${i + 1}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cột phải - thông tin xe */}
                        <div className="car-info-section">
                            <div className="car-header">
                                <div className="car-brand">{carData.brand}</div>
                                <h1 className="car-name">{carData.name}</h1>
                                <div className="car-price">
                  <span className="price-amount">
                    {formatPrice(carData.price)}
                  </span>
                                    <span className="price-currency">VND</span>
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
                                            <span className="spec-label">Chỗ ngồi</span>
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
                                            <span className="spec-label">Công suất pin</span>
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
                                        <div className="spec-icon">💸</div>
                                        <div className="spec-content">
                                            <span className="spec-value">{carData.specifications.costPerKm}</span>
                                            <span className="spec-label">Chi phí / km</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <div className="spec-icon">⏱️</div>
                                        <div className="spec-content">
                                            <span className="spec-value">{carData.specifications.chargeTime}</span>
                                            <span className="spec-label">Thời gian sạc</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="car-equipment">
                                <h3 className="section-title">Trang bị</h3>
                                <div className="equipment-grid">
                                    {carData.equipment.map((item, i) => (
                                        <div key={i} className="equipment-item">
                                            <span className="equipment-icon">✓</span>
                                            <span className="equipment-text">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="car-features">
                                <h3 className="section-title">Tính năng nổi bật</h3>
                                <ul className="features-list">
                                    {carData.features.map((feature, i) => (
                                        <li key={i} className="feature-item">
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

                            {/* ✅ Nút đặt xe */}
                            <div className="booking-section">
                                <button className="book-button" onClick={handleBookCar}>
                                    🚗 Đặt xe ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

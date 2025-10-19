import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import "./CarDetail.css";

export default function CarDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const carFromList = location.state;

    const { user: contextUser } = useAuth();
    const localUser =
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("ev_user"))
            : null;
    const currentUser = contextUser || localUser;

    const [carData, setCarData] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const [loginOverlay, setLoginOverlay] = useState({
        visible: false,
        message: "Bạn cần đăng nhập để đặt xe.",
    });

    // Ẩn overlay sau vài giây
    useEffect(() => {
        if (loginOverlay.visible) {
            const t = setTimeout(
                () => setLoginOverlay({ visible: false, message: "" }),
                6000
            );
            return () => clearTimeout(t);
        }
    }, [loginOverlay.visible]);

    // 🖼️ Tự động đổi ảnh mỗi 5s
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

    // 🚗 Ưu tiên dữ liệu từ CarPages (location.state), fallback gọi API nếu vào link trực tiếp
    useEffect(() => {
        if (carFromList) {
            const images = carFromList.images || [
                carFromList.modelPicture
                    ? `/carpic/${carFromList.modelPicture}`
                    : "/anhxe/default.jpg",
            ];

            const mappedCar = {
                id: carFromList.id || carFromList.vehicleModelId,
                name: `${carFromList.brand} ${carFromList.model}`,
                brand: carFromList.brand,
                price: carFromList.price,
                seats: carFromList.seats,
                availableCount: carFromList.availableCount,
                images: Array(4).fill(images[0]),
                stationId: carFromList.stationId || 1,
                stationName: carFromList.stationName || "Không rõ trạm",
                description: `
          <strong>${carFromList.brand} ${carFromList.model}</strong> là dòng xe điện hiện đại, 
          tiết kiệm năng lượng và thân thiện với môi trường. 
          Giá thuê chỉ <strong>${new Intl.NumberFormat("vi-VN").format(
                    carFromList.price * 1000
                )} VND/ngày</strong>.
        `,
                specifications: {
                    seats: carFromList.seats ?? 5,
                    transmission: "Tự động",
                    power: "Pin lithium 85kWh",
                    range: "210 km (ước lượng)",
                    chargeTime: "Khoảng 45 phút (sạc nhanh)",
                    costPerKm: "Khoảng 400₫/km",
                },
                equipment: [
                    "Camera 360",
                    "Phanh ABS",
                    "Cảm biến va chạm",
                    "Bluetooth",
                    "Cruise Control",
                ],
                features: [
                    "Thiết kế hiện đại",
                    "Vận hành êm ái",
                    "Công nghệ an toàn",
                    "Sạc nhanh",
                    "Tiết kiệm năng lượng",
                ],
            };
            setCarData(mappedCar);
        } else {
            // fallback nếu người dùng truy cập trực tiếp link
            const fetchCarDetail = async () => {
                try {
                    const res = await fetch(
                        `http://localhost:8084/EVRentalSystem/api/vehicles/${id}`
                    );
                    if (!res.ok) throw new Error("Không thể tải dữ liệu xe");
                    const data = await res.json();

                    const imagePath =
                        data.picture && `/carpic/${data.picture}` || "/anhxe/default.jpg";

                    const fallbackCar = {
                        id: data.id,
                        name: `${data.brand} ${data.model}`,
                        brand: data.brand,
                        price: data.price,
                        seats: data.seats,
                        images: Array(4).fill(imagePath),
                        description: `
              <strong>${data.brand} ${data.model}</strong> là dòng xe điện hiện đại,
              thân thiện môi trường và tiết kiệm chi phí vận hành.
              Giá thuê chỉ <strong>${new Intl.NumberFormat("vi-VN").format(
                            data.price * 1000
                        )} VND/ngày</strong>.
            `,
                        specifications: {
                            seats: data.seats,
                            transmission: "Tự động",
                            power: "Pin lithium 85kWh",
                            range: "210 km (ước lượng)",
                            chargeTime: "Khoảng 45 phút (sạc nhanh)",
                            costPerKm: "Khoảng 400₫/km",
                        },
                        equipment: ["Camera 360", "Bluetooth", "Cảm biến va chạm"],
                        features: ["Thiết kế hiện đại", "An toàn", "Tiết kiệm năng lượng"],
                    };
                    setCarData(fallbackCar);
                } catch (err) {
                    console.error("Lỗi khi tải dữ liệu xe:", err);
                }
            };
            fetchCarDetail();
        }
    }, [carFromList, id]);

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN").format(price * 1000);

    // ✅ Khi bấm "Đặt xe ngay"
    const handleBookCar = () => {
        if (!carData) return;

        if (!currentUser) {
            setLoginOverlay({
                visible: true,
                message:
                    "Bạn cần đăng nhập để đặt xe. Vui lòng đăng nhập hoặc đăng ký.",
            });
            return;
        }

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
                        {/* 🖼️ Cột trái - hình ảnh */}
                        <div className="car-images-section">
                            <div className="main-image-container">
                                <img
                                    src={carData.images[currentImageIndex]}
                                    alt={carData.name}
                                    className={`main-image ${isFading ? "fade-out" : ""}`}
                                />
                            </div>

                            {/* ✅ 4 hình nhỏ phía dưới */}
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

                            <div className="car-description">
                                <h3 className="section-title">Mô tả</h3>
                                <p
                                    className="description-text"
                                    dangerouslySetInnerHTML={{ __html: carData.description }}
                                ></p>
                            </div>

                            {/* ✅ Nút đặt xe */}
                            <div className="booking-section">
                                <button className="book-button" onClick={handleBookCar}>
                                    Đặt xe ngay
                                </button>
                            </div>
                        </div>

                        {/* 📋 Cột phải - thông tin xe */}
                        <div className="car-info-section">
                            <div className="car-header">
                                <div className="car-brand">{carData.brand}</div>
                                <h1 className="car-name">{carData.name}</h1>
                                <div className="car-price">
                  <span className="price-amount">
                    {formatPrice(carData.price)}
                  </span>
                                    <span className="price-currency">VND</span>
                                    <span className="price-period">/ 1 ngày</span>
                                </div>
                            </div>

                            <div className="car-specifications">
                                <h3 className="section-title">Thông số kỹ thuật</h3>
                                <div className="specs-grid">
                                    <div className="spec-item">
                                        <div className="spec-icon">👥</div>
                                        <div className="spec-content">
                      <span className="spec-value">
                        {carData.specifications.seats}
                      </span>
                                            <span className="spec-label">Chỗ ngồi</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <div className="spec-icon">⚙️</div>
                                        <div className="spec-content">
                      <span className="spec-value">
                        {carData.specifications.transmission}
                      </span>
                                            <span className="spec-label">Hộp số</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <div className="spec-icon">⚡</div>
                                        <div className="spec-content">
                      <span className="spec-value">
                        {carData.specifications.power}
                      </span>
                                            <span className="spec-label">Công suất pin</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <div className="spec-icon">🔋</div>
                                        <div className="spec-content">
                      <span className="spec-value">
                        {carData.specifications.range}
                      </span>
                                            <span className="spec-label">Tầm hoạt động</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <div className="spec-icon">💸</div>
                                        <div className="spec-content">
                      <span className="spec-value">
                        {carData.specifications.costPerKm}
                      </span>
                                            <span className="spec-label">Chi phí / km</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <div className="spec-icon">⏱️</div>
                                        <div className="spec-content">
                      <span className="spec-value">
                        {carData.specifications.chargeTime}
                      </span>
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
                        </div>
                    </div>
                </div>

                {/* Overlay yêu cầu đăng nhập */}
                {loginOverlay.visible && (
                    <div className="login-overlay">
                        <div className="login-overlay-content">
                            <h3>Bạn chưa đăng nhập</h3>
                            <p>{loginOverlay.message}</p>
                            <div className="login-overlay-actions">
                                <button className="login-btn" onClick={() => navigate("/login")}>
                                    Đăng nhập
                                </button>
                                <button
                                    className="close-btn"
                                    onClick={() =>
                                        setLoginOverlay({ visible: false, message: "" })
                                    }
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

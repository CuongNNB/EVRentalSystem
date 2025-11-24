import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CarPages.css";


const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    const formatted = (price * 1000).toLocaleString("vi-VN");
    return `${formatted} VND/ngày`;
};
// Thêm hàm này ở bên ngoài các Component (ví dụ: ngay dưới formatPrice)
const getCarImageSrc = (modelPicture) => {
    if (!modelPicture) return "/anhxe/1.jpg";
    if (modelPicture.toLowerCase().endsWith(".jpg")) {
        return `/carpic/${modelPicture}`;
    }
    return `data:image/jpeg;base64,${modelPicture}`;
};
function CarCard({ car }) {
    const navigate = useNavigate();

    // GỌI HÀM XỬ LÝ ẢNH Ở ĐÂY
    // Biến imageUrl sẽ chứa đường dẫn file hoặc chuỗi base64 hoàn chỉnh
    const imageUrl = getCarImageSrc(car.modelPicture);

    const handleViewDetails = () => {
        navigate(`/car/${car.vehicleModelId}`, {
            state: {
                id: car.vehicleModelId,
                brand: car.brand,
                model: car.model,
                price: car.price,
                seats: car.seats,
                availableCount: car.availableCount,
                modelPicture: car.modelPicture,
                // Sửa: Dùng biến imageUrl đã xử lý
                images: [imageUrl],
            },
        });
    };

    const handleBookNow = () => {
        navigate(`/booking/${car.vehicleModelId}`, {
            state: {
                id: car.vehicleModelId,
                name: `${car.brand} ${car.model}`,
                price: car.price,
                // Sửa: Dùng biến imageUrl đã xử lý
                images: [imageUrl],
            },
        });
    };

    return (
        <article className="car-card">
            <div className="car-card__media">
                {/* Sửa: Kiểm tra car.modelPicture có tồn tại không, nếu có dùng imageUrl làm src */}
                {car.modelPicture ? (
                    <img
                        src={imageUrl}
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
                    <p className="car-card__subtitle">{car.brand}</p>
                </div>
                <div className="car-card__price-wrapper">
                    <span className="car-card__price-label">Giá thuê</span>
                    <p className="car-card__price">{formatPrice(car.price)}</p>
                </div>
            </div>

            <ul className="car-card__features">
                <li className="car-card__feature">Số ghế: {car.seats}</li>
                <li className="car-card__feature">Xe có sẵn: {car.availableCount}</li>
            </ul>

            <div className="car-card__actions">
                <button
                    type="button"
                    className="car-card__cta car-card__cta--secondary"
                    onClick={handleViewDetails}
                >
                    Xem chi tiết
                </button>
                <button
                    type="button"
                    className="car-card__cta car-card__cta--primary"
                    onClick={handleBookNow}
                >
                    Đặt ngay
                </button>
            </div>
        </article>
    );
}

export default function CarPages() {
    const [filterOptions, setFilterOptions] = useState([
        { label: "Tất cả xe điện", value: "all" }
    ]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [cars, setCars] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8084/EVRentalSystem/api/vehicles/available")
            .then((res) => res.json())
            .then((data) => setCars(data))
            .catch((err) => console.error("Lỗi khi lấy danh sách xe:", err));

        fetch("http://localhost:8084/EVRentalSystem/api/vehicles/brands")
            .then((res) => res.json())
            .then((data) => {
                // data trả về dạng: [{id: "1", brand: "VinFast"}, {id: "2", brand: "VinFast"}, ...]

                // Bước 1: Lấy ra mảng chỉ chứa tên brand
                const allBrands = data.map(item => item.brand);

                // Bước 2: Dùng Set để lọc trùng (VinFast xuất hiện 2 lần sẽ chỉ còn 1)
                const uniqueBrands = [...new Set(allBrands)];

                // Bước 3: Tạo mảng options cho UI
                const newFilters = uniqueBrands.map(brandName => ({
                    label: brandName,  // Hiển thị: VinFast
                    value: brandName   // Giá trị dùng để lọc: VinFast
                }));

                // Bước 4: Gộp với nút "Tất cả" ban đầu và cập nhật State
                setFilterOptions([
                    { label: "Tất cả xe điện", value: "all" },
                    ...newFilters
                ]);
            })
            .catch((err) => console.error("Lỗi khi lấy danh sách hãng:", err));
    }, []);


    const filteredCars = useMemo(() => {
        // lọc theo hãng xe và chỉ lấy xe có availableCount > 0
        let result = cars.filter((car) => car.availableCount > 0);

        if (activeFilter !== "all") {
            result = result.filter(
                (car) =>
                    car.brand &&
                    car.brand.toLowerCase().includes(activeFilter.toLowerCase())
            );
        }

        return result;
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
                        Bộ sưu tập 100% xe điện được kiểm tra định kỳ, tích hợp bảo hiểm và hỗ trợ sạc 24/7.
                    </p>
                    <h4>Chọn loại xe bạn thích</h4>
                    <div className="car-filters" role="tablist" aria-label="Lọc theo hãng xe điện">
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
                            <CarCard key={car.vehicleModelId} car={car} />
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

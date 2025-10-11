import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./BookingPage.css";

// ✅ Hàm định dạng datetime cho input
const formatDateTimeLocal = (date) => {
    const pad = (n) => (n < 10 ? "0" + n : n);
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const paymentMethods = [
    "Thanh toán qua điện thoại",
    "Thanh toán qua thẻ tín dụng",
    "Thanh toán qua ví điện tử",
    "Thanh toán khi nhận xe",
];

const pickupLocations = [
    "EV Station - Bình Thạnh",
    "EV Station - Thủ Đức",
    "EV Station - Biên Hòa",
    "EV Station - TP Mỹ Tho",
    "EV Station - TP Bến Tre",
    "EV Station - Tân Bình",
    "EV Station - Long An",
    "EV Station - Cần Thơ",
    "EV Station - Bình Dương",
    "EV Station - Vũng Tàu",
];

export default function BookingPage() {
    const { carId } = useParams(); // ✅ chuẩn với route mới
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // ✅ Lấy dữ liệu xe từ CarDetail
    const passedCar = location.state;
    const bookingImage = passedCar?.images?.[0] || "/anhxe/default.jpg";
    const bookingName = passedCar?.name || "Xe điện";
    const bookingPrice = passedCar?.price ? passedCar.price * 1000 : 1000000;
    const carData = passedCar || {
        id: carId,
        name: bookingName,
        location: "Thành phố Hồ Chí Minh",
        specifications: {
            seats: 4,
            transmission: "Tự động",
            power: "43 HP",
            range: "210 km (NEDC)",
            costPerKm: "400đ/km",
            chargeTime: "45 phút (sạc nhanh)",
        },
    };

    // ✅ Lấy thông tin user từ context (đã login)
    const storedUser = user && user.email
        ? {
            name: user.fullName || user.name || "Người dùng",
            email: user.email,
            phone: user.phone || user.phoneNumber || "",
        }
        : { name: "Người dùng", email: "user@gmail.com", phone: "" };

    // ✅ Ngày & giờ mặc định: hôm nay và ngày mai
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const [formData, setFormData] = useState({
        renterName: storedUser.name,
        phoneNumber: storedUser.phone,
        email: storedUser.email,
        pickupDateTime: formatDateTimeLocal(now),
        returnDateTime: formatDateTimeLocal(tomorrow),
        paymentMethod: "Thanh toán qua điện thoại",
        pickupLocation: "EV Station - Bình Thạnh",
    });

    const [isBooking, setIsBooking] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const calculateRentalDays = () => {
        const start = new Date(formData.pickupDateTime);
        const end = new Date(formData.returnDateTime);
        const diff = Math.abs(end - start);
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
    };

    // ✅ Tính tiền đặt cọc = 30% tổng tiền
    const calculateTotal = () => {
        const days = calculateRentalDays();
        const dailyPrice = bookingPrice;
        const totalRental = dailyPrice * days;
        const deposit = Math.round(totalRental * 0.3);
        return { dailyPrice, days, totalRental, deposit, totalToPay: deposit };
    };

    const totals = calculateTotal();
    const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p);

    // ✅ Khi ấn “Đặt xe ngay”
    const handleBooking = () => {
        setIsBooking(true);

        const summary = {
            car: {
                id: carId,
                name: bookingName,
                image: bookingImage,
                licensePlate: "Đang cập nhật",
                color: "Trắng",
            },
            rental: {
                pickupLocation: formData.pickupLocation,
                pickupDate: formData.pickupDateTime,
                returnDate: formData.returnDateTime,
                days: calculateRentalDays(),
            },
            pricing: {
                dailyRate: totals.dailyPrice,
                days: totals.days,
                subtotal: totals.totalRental,
                vat: Math.round(totals.totalRental * 0.1),
                total: Math.round(totals.totalRental * 1.1),
                deposit: totals.deposit,
            },
            renter: {
                name: formData.renterName,
                email: formData.email,
                phone: formData.phoneNumber,
            },
        };

        // ✅ Lưu thông tin booking vào localStorage
        localStorage.setItem("currentBooking", JSON.stringify(summary));

        // ✅ Điều hướng đến trang hợp đồng
        navigate(`/contract/${carId}`, { state: summary });

        setIsBooking(false);
    };

    return (
        <div className="booking-page">
            <Header />
            <main className="booking-main">
                <div className="booking-container">
                    <h1 className="booking-title">Đặt xe</h1>

                    <div className="booking-content">
                        {/* Bên trái: form */}
                        <div className="booking-form-section">
                            <div className="form-card">
                                <h2 className="form-title">Thông tin người thuê</h2>

                                <div className="form-group">
                                    <label className="form-label">Họ và tên</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.renterName}
                                        onChange={(e) => handleInputChange("renterName", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ngày & giờ nhận xe</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.pickupDateTime}
                                        onChange={(e) => handleInputChange("pickupDateTime", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ngày & giờ trả xe</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.returnDateTime}
                                        onChange={(e) => handleInputChange("returnDateTime", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phương thức thanh toán</label>
                                    <div className="form-select-wrapper">
                                        <select
                                            className="form-select"
                                            value={formData.paymentMethod}
                                            onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                                        >
                                            {paymentMethods.map((m) => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Địa điểm nhận xe</label>
                                    <div className="form-select-wrapper">
                                        <select
                                            className="form-select"
                                            value={formData.pickupLocation}
                                            onChange={(e) => handleInputChange("pickupLocation", e.target.value)}
                                        >
                                            {pickupLocations.map((loc) => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bên phải: thông tin xe */}
                        <div className="car-details-section">
                            <div className="car-details-card">
                                <div className="car-image-container">
                                    <img src={bookingImage} alt={bookingName} className="car-image" />
                                </div>

                                <div className="car-info">
                                    <h3 className="car-name">{bookingName}</h3>
                                    <p className="car-location">{carData.location}</p>
                                </div>

                                <div className="car-specifications">
                                    <h4 className="specs-title">Thông số kỹ thuật</h4>
                                    <div className="specs-grid">
                                        <div className="spec-item"><span className="spec-icon">👥</span><span className="spec-value">{carData.specifications.seats}</span><span className="spec-label">Chỗ ngồi</span></div>
                                        <div className="spec-item"><span className="spec-icon">⚙️</span><span className="spec-value">{carData.specifications.transmission}</span><span className="spec-label">Hộp số</span></div>
                                        <div className="spec-item"><span className="spec-icon">⚡</span><span className="spec-value">{carData.specifications.power}</span><span className="spec-label">Công suất</span></div>
                                        <div className="spec-item"><span className="spec-icon">🔋</span><span className="spec-value">{carData.specifications.range}</span><span className="spec-label">Tầm hoạt động</span></div>
                                        <div className="spec-item"><span className="spec-icon">💸</span><span className="spec-value">{carData.specifications.costPerKm}</span><span className="spec-label">Chi phí/km</span></div>
                                        <div className="spec-item"><span className="spec-icon">⏱️</span><span className="spec-value">{carData.specifications.chargeTime}</span><span className="spec-label">Thời gian sạc</span></div>
                                    </div>
                                </div>

                                <div className="cost-summary">
                                    <div className="cost-item"><span className="cost-label">Giá thuê/ngày:</span><span className="cost-value">{formatPrice(totals.dailyPrice)}₫</span></div>
                                    <div className="cost-item"><span className="cost-label">Số ngày thuê:</span><span className="cost-value">{totals.days} ngày</span></div>
                                    <div className="cost-item"><span className="cost-label">Tổng tiền thuê:</span><span className="cost-value">{formatPrice(totals.totalRental)}₫</span></div>
                                    <div className="cost-item"><span className="cost-label">Đặt cọc (30%):</span><span className="cost-value">{formatPrice(totals.deposit)}₫</span></div>
                                    <div className="cost-item total-cost"><span className="cost-label">Tổng cần thanh toán:</span><span className="cost-value">{formatPrice(totals.totalToPay)} VNĐ</span></div>
                                </div>

                                <button
                                    className={`book-button ${isBooking ? "loading" : ""}`}
                                    onClick={handleBooking}
                                    disabled={isBooking}
                                >
                                    {isBooking ? (<><span className="spinner"></span>Đang xử lý...</>) : ("Đặt xe")}
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

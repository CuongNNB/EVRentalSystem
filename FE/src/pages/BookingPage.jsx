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

export default function BookingPage() {
    const { carId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user: contextUser } = useAuth();
    const localUser = JSON.parse(localStorage.getItem("ev_user"));
    const user = contextUser || localUser

    // ✅ Lấy dữ liệu xe từ CarDetail
    const passedCar = location.state;
    const bookingImage = passedCar?.images?.[0] || "/anhxe/default.jpg";
    const bookingName = passedCar?.name || "Xe điện";
    const pickupStation = passedCar?.stationName;
    const bookingPrice = passedCar?.price ? passedCar.price * 1000 : 1000000;

    // ✅ Thông tin mặc định nếu không có dữ liệu truyền sang
    const carData = passedCar || {
        id: carId,
        name: bookingName,
        stationId: 1,
        stationName: "EV Station - Bình Thạnh",
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

    // ✅ Lấy thông tin user
    const storedUser = user && user.email
        ? {
            id: user.id || user.userId || user?.data?.id,
            name: user.fullName || user.name || user.username || "Người dùng",
            email: user.email,
            phone: user.phone || user.phoneNumber || "",
        }
        : { id: 1, name: "Người dùng", email: "user@gmail.com", phone: "" };

    // ✅ Ngày & giờ mặc định
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
        pickupLocation: carData.stationName,
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

    // ✅ Tính tiền đặt cọc = 30%
    const calculateTotal = () => {
        const days = calculateRentalDays();
        const dailyPrice = bookingPrice;
        const totalRental = dailyPrice * days;
        const deposit = Math.round(totalRental * 0.3);
        return { dailyPrice, days, totalRental, deposit, totalToPay: deposit };
    };

    const totals = calculateTotal();
    const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p);

    // ✅ Gọi API đặt xe
    const handleBooking = async () => {
        setIsBooking(true);

        const payload = {
            userId: storedUser.id,
            vehicleModelId: passedCar?.id || parseInt(carId),
            stationId: passedCar?.stationId || carData.stationId,
            startTime: formData.pickupDateTime,
            expectedReturnTime: formData.returnDateTime,
            deposit: totals.deposit, // ✅ gửi tiền cọc
        };

        console.log("📤 Payload gửi backend:", payload);

        try {
            const response = await fetch("http://localhost:8084/EVRentalSystem/api/user/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Booking failed");

            const data = await response.json();
            console.log("✅ Booking success:", data);

            // ✅ Tạo object fullBooking gom toàn bộ dữ liệu
            const fullBooking = {
                bookingPayload: payload,
                bookingForm: formData,
                carData,
                user: storedUser,
                totals,
                depositAmount: totals.deposit,
                timestamp: new Date().toISOString(),
            };

            // ✅ Lưu list vào localStorage
            const existingBookings = JSON.parse(localStorage.getItem("bookingList")) || [];
            existingBookings.push({ ...fullBooking, response: data });
            localStorage.setItem("bookingList", JSON.stringify(existingBookings));

            // ✅ Lưu booking hiện tại (cho ContractPage dự phòng)
            localStorage.setItem("currentBooking", JSON.stringify({ ...fullBooking, response: data }));

            // ✅ Forward toàn bộ sang ContractPage
            navigate(`/contract/${carId}`, {
                state: {
                    fullBooking,
                    response: data,
                },
            });

        } catch (error) {
            console.error("❌ Lỗi khi đặt xe:", error);
            alert("Đặt xe thất bại! Vui lòng thử lại.");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="booking-page">
            <Header />
            <main className="booking-main">
                <div className="booking-container">
                    <h1 className="booking-title">Đặt xe</h1>

                    <div className="booking-content">
                        {/* Form bên trái */}
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
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={pickupStation || formData.pickupLocation}
                                        readOnly
                                    />
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
                                    <p className="car-location">{pickupStation}</p>
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

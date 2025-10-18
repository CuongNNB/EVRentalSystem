import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./BookingPage.css";

const pad = (n) => (n < 10 ? "0" + n : n);
const formatDateTimeLocal = (date) => {
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
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
    const user = contextUser || localUser;

    const passedCar = location.state;
    const bookingImage = passedCar?.images?.[0] || "/anhxe/default.jpg";
    const bookingName = passedCar?.name || "Xe điện";
    const pickupStation = passedCar?.stationName;
    const bookingPrice = passedCar?.price ? passedCar.price * 1000 : 1000000;

    const carData = passedCar || {
        id: carId,
        name: bookingName,
        stationId: 1,
        stationName: "EV Station - Bình Thạnh",
        location: "Thành phố Hồ Chí Minh",
        images: [bookingImage],
        specifications: {
            seats: 4,
            transmission: "Tự động",
            power: "43 HP",
            range: "210 km (NEDC)",
            costPerKm: "400đ/km",
            chargeTime: "45 phút (sạc nhanh)",
        },
    };

    const storedUser = user && user.email
        ? {
            id: user.id || user.userId || user?.data?.id,
            name: user.fullName || user.name || user.username || "Người dùng",
            email: user.email,
            phone: user.phone || user.phoneNumber || "",
        }
        : { id: 1, name: "Người dùng", email: "user@gmail.com", phone: "" };

    // now at component mount
    const now = new Date();
    // Round now to nearest minute to avoid seconds issues
    now.setSeconds(0);
    now.setMilliseconds(0);

    const defaultPickup = formatDateTimeLocal(now);
    const defaultReturn = formatDateTimeLocal(addDays(now, 1));

    const [formData, setFormData] = useState({
        renterName: storedUser.name,
        phoneNumber: storedUser.phone,
        email: storedUser.email,
        pickupDateTime: defaultPickup,
        returnDateTime: defaultReturn,
        paymentMethod: "Thanh toán qua điện thoại",
        pickupLocation: carData.stationName,
    });

    const [isBooking, setIsBooking] = useState(false);

    // overlay error state
    const [errorOverlay, setErrorOverlay] = useState({ visible: false, message: "" });

    useEffect(() => {
        let t;
        if (errorOverlay.visible) {
            t = setTimeout(() => setErrorOverlay({ visible: false, message: "" }), 5000);
        }
        return () => clearTimeout(t);
    }, [errorOverlay.visible]);

    const showError = (message) => {
        setErrorOverlay({ visible: true, message });
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Validations + constraints
    const getNow = () => {
        const d = new Date();
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
    };

    const handlePickupChange = (e) => {
        const val = e.target.value;
        const selected = new Date(val);
        const nowDate = getNow();
        const maxPickup = addDays(nowDate, 5);

        if (selected < nowDate) {
            showError("Thời gian nhận xe không được chọn trong quá khứ. Đã đặt lại về thời gian hiện tại.");
            handleInputChange("pickupDateTime", formatDateTimeLocal(nowDate));

            // ensure return is not before pickup
            const returnDate = new Date(formData.returnDateTime);
            if (returnDate <= nowDate) {
                const newReturn = addDays(nowDate, 1);
                handleInputChange("returnDateTime", formatDateTimeLocal(newReturn));
            }
            return;
        }

        if (selected > maxPickup) {
            showError("Thời gian nhận xe chỉ được phép trong vòng 5 ngày kể từ lúc đặt.");
            handleInputChange("pickupDateTime", formatDateTimeLocal(maxPickup));

            // adjust return if needed
            const returnDate = new Date(formData.returnDateTime);
            if (returnDate <= maxPickup) {
                const newReturn = addDays(maxPickup, 1);
                handleInputChange("returnDateTime", formatDateTimeLocal(newReturn));
            }
            return;
        }

        // valid
        handleInputChange("pickupDateTime", val);

        // If return is earlier than pickup, push return to pickup + 1 hour
        const returnDate = new Date(formData.returnDateTime);
        if (returnDate <= selected) {
            const minReturn = new Date(selected.getTime() + 60 * 60 * 1000); // +1 hour
            handleInputChange("returnDateTime", formatDateTimeLocal(minReturn));
        }
    };

    const handleReturnChange = (e) => {
        const val = e.target.value;
        const selected = new Date(val);
        const pickup = new Date(formData.pickupDateTime);
        const nowDate = getNow();
        const maxReturn = addDays(pickup, 30);

        if (selected < pickup) {
            showError("Thời gian trả xe phải sau thời gian nhận xe. Đã đặt lại về tối thiểu 1 giờ sau khi nhận xe.");
            const minReturn = new Date(pickup.getTime() + 60 * 60 * 1000);
            handleInputChange("returnDateTime", formatDateTimeLocal(minReturn));
            return;
        }

        if (selected > maxReturn) {
            showError("Thời gian trả xe chỉ được phép trong vòng 30 ngày kể từ lúc nhận xe.");
            handleInputChange("returnDateTime", formatDateTimeLocal(maxReturn));
            return;
        }

        // also prevent selecting return in the past
        if (selected < nowDate) {
            showError("Thời gian trả xe không thể ở quá khứ. Đã đặt lại về tối thiểu 1 giờ sau khi nhận xe hoặc thời gian hiện tại.");
            const minReturn = new Date(Math.max(pickup.getTime() + 60 * 60 * 1000, nowDate.getTime()));
            handleInputChange("returnDateTime", formatDateTimeLocal(minReturn));
            return;
        }

        handleInputChange("returnDateTime", val);
    };

    // NEW: calculate days/hours/minutes between pickup and return
    const calculateDaysHours = () => {
        const start = new Date(formData.pickupDateTime);
        const end = new Date(formData.returnDateTime);
        let diffMs = end - start;
        if (diffMs <= 0) {
            return { days: 0, hours: 0, totalHours: 0 };
        }
        const totalHoursFloat = diffMs / (1000 * 60 * 60);
        // Ensure at least 1 hour
        const totalHours = Math.max(1, totalHoursFloat);
        let days = Math.floor(totalHours / 24);
        let hours = Math.floor(totalHours - days * 24);
        // handle case hours === 24 (rare due rounding) -> increment day
        if (hours >= 24) {
            days += Math.floor(hours / 24);
            hours = hours % 24;
        }
        const roundedTotalHours = days * 24 + hours;
        return { days, hours, totalHours: roundedTotalHours };
    };

    // NEW: calculate totals by hourly conversion
    const calculateTotalsByHours = () => {
        const { days, hours, totalHours } = calculateDaysHours();
        const dailyPrice = bookingPrice;
        const hourlyRate = dailyPrice / 24;
        // Compute total rental by multiplying hourlyRate * totalHours
        const totalRental = Math.round(hourlyRate * totalHours);
        const deposit = Math.round(totalRental * 0.3);
        const totalToPay = deposit; // same as previous behavior (pay deposit)
        return { dailyPrice, days, hours, totalHours, hourlyRate, totalRental, deposit, totalToPay };
    };

    const totals = calculateTotalsByHours();

    const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p);

    // Booking / navigation logic unchanged from original
    const makeFullBooking = (apiResponse = null) => ({
        bookingPayload: {
            userId: storedUser.id,
            vehicleModelId: passedCar?.id || parseInt(carId),
            stationId: passedCar?.stationId || carData.stationId,
            startTime: formData.pickupDateTime,
            expectedReturnTime: formData.returnDateTime,
            deposit: totals.deposit,
        },
        bookingForm: formData,
        carData,
        user: storedUser,
        totals,
        depositAmount: totals.deposit,
        response: apiResponse,
        timestamp: new Date().toISOString(),
    });

    const buildContractSummary = (fullBooking, apiResponse = null) => {
        const contractId = apiResponse?.contractId || `CT-${Date.now()}`;

        const contractData = {
            contractId,
            renter: {
                name: fullBooking.user?.name,
                email: fullBooking.user?.email,
                phone: fullBooking.user?.phone,
                address: fullBooking.user?.address || '',
            },
            car: {
                id: fullBooking.carData?.id,
                name: fullBooking.carData?.name,
                licensePlate: fullBooking.carData?.licensePlate || '---',
                color: fullBooking.carData?.color || '',
                price: fullBooking.totals?.dailyPrice,
                rentalDays: `${fullBooking.totals?.days} ngày ${fullBooking.totals?.hours} giờ`,
                totalAmount: fullBooking.totals?.totalRental,
                deposit: fullBooking.totals?.deposit,
            },
            rental: {
                startDate: fullBooking.bookingForm?.pickupDateTime,
                endDate: fullBooking.bookingForm?.returnDateTime,
                pickupLocation: fullBooking.bookingForm?.pickupLocation || fullBooking.carData?.stationName,
            }
        };

        return {
            contractData,
            bookingData: {
                bookingForm: fullBooking.bookingForm,
                bookingPayload: fullBooking.bookingPayload,
                meta: { forwardedAt: new Date().toISOString() },
            }
        };
    };

    const handleBooking = async () => {
        setIsBooking(true);
        const payload = {
            userId: storedUser.id,
            vehicleModelId: passedCar?.id || parseInt(carId),
            stationId: passedCar?.stationId || carData.stationId,
            startTime: formData.pickupDateTime,
            expectedReturnTime: formData.returnDateTime,
            deposit: totals.deposit,
        };

        try {
            const response = await fetch("http://localhost:8084/EVRentalSystem/api/user/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Booking failed");

            const data = await response.json();

            const fullBooking = makeFullBooking(data);

            const existingBookings = JSON.parse(localStorage.getItem("bookingList")) || [];
            existingBookings.push(fullBooking);
            localStorage.setItem("bookingList", JSON.stringify(existingBookings));
            localStorage.setItem("currentBooking", JSON.stringify(fullBooking));

            const contractSummary = buildContractSummary(fullBooking, data);
            navigate("/deposit-payment", {
                state: {
                    contractSummary,
                },
            });

        } catch (error) {
            console.error("Lỗi khi đặt xe:", error);
            showError("Đặt xe thất bại! Vui lòng thử lại.");
        } finally {
            setIsBooking(false);
        }
    };

    const handleGoToDeposit = () => {
        const fullBooking = makeFullBooking(null);
        const contractSummary = buildContractSummary(fullBooking, null);

        navigate("/deposit-payment", {
            state: {
                contractSummary,
            },
        });
    };

    // min / max attributes for inputs
    const minPickup = formatDateTimeLocal(getNow());
    const maxPickup = formatDateTimeLocal(addDays(getNow(), 5));
    const minReturnAttr = formData.pickupDateTime; // return must be >= pickup
    const maxReturnAttr = formatDateTimeLocal(addDays(new Date(formData.pickupDateTime), 30));

    return (
        <div className="booking-page">
            <Header />
            <main className="booking-main">
                <div className="booking-container">
                    <h1 className="booking-title">Đặt xe</h1>

                    <div className="booking-content">
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
                                        onChange={handlePickupChange}
                                        min={minPickup}
                                        max={maxPickup}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ngày & giờ trả xe</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.returnDateTime}
                                        onChange={handleReturnChange}
                                        min={minReturnAttr}
                                        max={maxReturnAttr}
                                    />
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

                        <div className="car-details-section">
                            <div className="car-details-card">
                                <div className="car-image-container">
                                    <img src={bookingImage} alt={bookingName} className="car-image" />
                                </div>

                                <div className="car-info">
                                    <h3 className="car-name">{bookingName}</h3>
                                    <p className="car-location">{pickupStation}</p>
                                </div>


                                <div className="cost-summary">
                                    <div className="cost-item"><span className="cost-label">Giá thuê/ngày:</span><span className="cost-value">{formatPrice(totals.dailyPrice)}₫</span></div>
                                    <div className="cost-item"><span className="cost-label">Số ngày thuê:</span><span className="cost-value">{totals.days} ngày {totals.hours} giờ</span></div>
                                    <div className="cost-item"><span className="cost-label">Tổng tiền thuê:</span><span className="cost-value">{formatPrice(totals.totalRental)}₫</span></div>
                                    <div className="cost-item"><span className="cost-label">Đặt cọc (30%):</span><span className="cost-value">{formatPrice(totals.deposit)}₫</span></div>
                                    <div className="cost-item total-cost"><span className="cost-label">Tổng tiền cọc cần thanh toán:</span><span className="cost-value">{formatPrice(totals.totalToPay)} VNĐ</span></div>
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        className={`book-button ${isBooking ? "loading" : ""}`}
                                        onClick={handleBooking}
                                        disabled={isBooking}
                                    >
                                        {isBooking ? (<><span className="spinner"></span>Đang xử lý...</>) : ("Thanh toán cọc")}
                                    </button>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Error overlay */}
                {errorOverlay.visible && (
                    <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999}}>
                        <div style={{background: '#fff', padding: 20, borderRadius: 8, width: 'min(420px, 90%)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'}}>
                            <h3 style={{marginTop: 0, marginBottom: 8}}>Lỗi</h3>
                            <p style={{marginTop: 0, marginBottom: 16}}>{errorOverlay.message}</p>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                                <button onClick={() => setErrorOverlay({ visible: false, message: "" })} style={{padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#fff'}}>Đóng</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
}

import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import OtpInput from "react-otp-input";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ContractPage.css";

export default function ContractPage() {
    const { carId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const renterSignRef = useRef(null);

    // ✅ Lấy dữ liệu từ BookingPage (state hoặc localStorage)
    const { fullBooking, response } = location.state || {};
    const storedBooking =
        fullBooking || JSON.parse(localStorage.getItem("currentBooking")) || {};

    // ✅ Gộp dữ liệu cần thiết
    const booking = storedBooking.bookingForm || {};
    const car = storedBooking.carData || {};
    const totals = storedBooking.totals || {};
    const user = storedBooking.user || {};
    const backendResponse = response || storedBooking.response || {};

    const [contractData] = useState(() => ({
        contractId: `EV${Date.now()}`,
        renter: {
            name: user.name || backendResponse.renterName || "Người thuê xe",
            email: user.email || "user@gmail.com",
            phone: user.phone || "Chưa cập nhật",
            address: "Chưa cập nhật",
            birthDate: "Chưa cập nhật",
            idNumber: "Chưa cập nhật",
            licenseNumber: "Chưa cập nhật",
        },
        car: {
            name: backendResponse.vehicleModel || car.name || "Xe điện",
            color: car.color || "Trắng",
            price: totals.dailyPrice || backendResponse.totalAmount || 0,
            rentalDays: totals.days || 1,
            totalAmount: backendResponse.totalAmount || totals.totalRental || 0,
            deposit: totals.deposit || backendResponse.deposit || 0,
            station: backendResponse.stationName || car.stationName || "EV Station",
            includedKm: 200,
        },
        rental: {
            startDate: booking.pickupDateTime
                ? new Date(booking.pickupDateTime).toLocaleDateString("vi-VN")
                : "Hôm nay",
            endDate: booking.returnDateTime
                ? new Date(booking.returnDateTime).toLocaleDateString("vi-VN")
                : "Ngày mai",
            startTime: booking.pickupDateTime
                ? new Date(booking.pickupDateTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
                : "08:00",
            endTime: booking.returnDateTime
                ? new Date(booking.returnDateTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
                : "18:00",
            pickupLocation:
                booking.pickupLocation || backendResponse.stationName || "EV Station",
        },
    }));

    // ✅ Quản lý chữ ký và OTP
    const [renterSign, setRenterSign] = useState(null);
    const [ownerSign, setOwnerSign] = useState(null);
    const [isSignedB, setIsSignedB] = useState(false);
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpMessage, setOtpMessage] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setOwnerSign(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        );
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendTimer]);

    const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p || 0);

    const handleConfirmSign = () => {
        const sign = renterSignRef.current?.toDataURL();
        if (sign) {
            setRenterSign(sign);
            setIsSignedB(true);
        }
    };

    const handleClearSign = () => {
        renterSignRef.current?.clear();
        setRenterSign(null);
        setIsSignedB(false);
        setOtp("");
        setOtpMessage("");
        setOtpError("");
        setIsOtpSent(false);
        setOtpVerified(false);
        setResendTimer(0);
    };

    // ✅ Demo gửi OTP
    const handleSendOtp = () => {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otpCode);
        setIsOtpSent(true);
        setOtpMessage(`📩 Mã OTP của bạn là: ${otpCode}`);
        setOtpError("");
        setResendTimer(60);
        alert(`Mã OTP demo của bạn là: ${otpCode}`);
    };

    const handleVerifyOtp = () => {
        if (otp.length !== 6) {
            setOtpError("Nhập đủ 6 số OTP");
            return;
        }
        if (otp === generatedOtp) {
            setOtpVerified(true);
            setOtpMessage("✅ Xác thực OTP thành công!");
            setOtpError("");
        } else {
            setOtpError("❌ Sai OTP, vui lòng thử lại");
        }
    };

    const handleSubmitContract = () => {
        if (!otpVerified) {
            setOtpError("Cần xác thực OTP trước khi hoàn tất");
            return;
        }

        // ✅ Gom toàn bộ dữ liệu hợp đồng
        const contractSummary = {
            contractId: contractData.contractId,
            contractData,
            fullBooking,
            response,
            renterSign,
            ownerSign,
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem("currentContract", JSON.stringify(contractSummary));

        navigate("/deposit-payment", { state: { contractSummary } });
    };

    const currentDateTime = new Date().toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    });

    return (
        <div className="contract-page">
            <Header />
            <main className="contract-main">
                <div className="contract-container">
                    <div className="contract-header">
                        <h1>HỢP ĐỒNG THUÊ XE Ô TÔ #{contractData.contractId}</h1>
                        <p>Ngày lập: <strong>{currentDateTime}</strong></p>
                        <p>Mã đặt xe: <strong>{backendResponse.bookingId || "N/A"}</strong></p>
                        <p>Trạng thái: <strong>{backendResponse.status || "Đang chờ xác nhận"}</strong></p>
                    </div>

                    <div className="contract-scroll-box">
                        <div className="contract-content">
                            <h2>Điều 1: Thông tin các bên</h2>
                            <p>
                                <strong>Bên A:</strong> Công ty TNHH EV Car Rental — Địa chỉ:
                                123 Nguyễn Văn Cừ, Quận 5, TP.HCM.
                            </p>
                            <p>
                                <strong>Bên B:</strong> {contractData.renter.name} — SĐT:{" "}
                                <strong>{contractData.renter.phone}</strong> — Email:{" "}
                                <strong>{contractData.renter.email}</strong>
                            </p>

                            <h2>Điều 2: Thông tin xe</h2>
                            <p><strong>Tên xe:</strong> {contractData.car.name}</p>
                            <p><strong>Màu sắc:</strong> {contractData.car.color}</p>
                            <p><strong>Trạm nhận xe:</strong> {contractData.car.station}</p>

                            <h2>Điều 3: Thời gian và chi phí</h2>
                            <p>
                                <strong>Thời gian thuê:</strong> Từ {contractData.rental.startDate} ({contractData.rental.startTime})
                                đến {contractData.rental.endDate} ({contractData.rental.endTime})
                            </p>
                            <p><strong>Địa điểm nhận xe:</strong> {contractData.rental.pickupLocation}</p>
                            <p><strong>Giá thuê/ngày:</strong> {formatPrice(contractData.car.price)}₫</p>
                            <p><strong>Số ngày thuê:</strong> {contractData.car.rentalDays} ngày</p>
                            <p><strong>Đặt cọc:</strong> {formatPrice(contractData.car.deposit)}₫</p>
                            <p><strong>Tổng cộng:</strong> {formatPrice(contractData.car.totalAmount)}₫</p>

                            <h2>Điều 4: Quy định sử dụng</h2>
                            <p>• Xe phải được sử dụng đúng mục đích và bảo quản cẩn thận.</p>
                            <p>• Không cho thuê lại, không dùng xe vào hoạt động trái pháp luật.</p>

                            <h2>Điều 5: Trách nhiệm và xử lý vi phạm</h2>
                            <p>• Nếu gây hư hỏng, mất mát: Bên B chịu chi phí sửa chữa hoặc bồi thường.</p>
                            <p>• Trả xe trễ phụ thu 20% giá thuê/ngày.</p>

                            <h2>Điều 6: Bảo hiểm và giới hạn quãng đường</h2>
                            <p>• Xe có bảo hiểm dân sự.</p>
                            <p>• Bao gồm {contractData.car.includedKm} km/ngày, vượt tính 5.000₫/km.</p>

                            <h2>Điều 7: Hiệu lực hợp đồng</h2>
                            <p>• Có hiệu lực khi hai bên ký và xác thực OTP.</p>
                        </div>
                    </div>

                    {/* --- Ký tên --- */}
                    <div className="signature-section">
                        <h2>CHỮ KÝ ĐIỆN TỬ</h2>
                        <div className="signature-grid">
                            <div className="signature-box">
                                <h3>Bên B - Người thuê xe</h3>
                                {!isSignedB ? (
                                    <SignatureCanvas
                                        ref={renterSignRef}
                                        canvasProps={{ width: 300, height: 150, className: "signature-canvas" }}
                                    />
                                ) : (
                                    <img src={renterSign} alt="Chữ ký Bên B" className="signature-image" />
                                )}
                                <div className="signature-actions">
                                    {!isSignedB ? (
                                        <>
                                            <button className="btn-clear" onClick={handleClearSign}>Xóa ký</button>
                                            <button className="btn-confirm" onClick={handleConfirmSign}>Xác nhận ký</button>
                                        </>
                                    ) : (
                                        <button className="btn-clear" onClick={handleClearSign}>Ký lại</button>
                                    )}
                                </div>
                            </div>

                            <div className="signature-box">
                                <h3>Bên A - Công ty cho thuê</h3>
                                <img src={ownerSign} alt="Chữ ký Bên A" className="signature-image" />
                                <p>✅ Đã ký sẵn</p>
                            </div>
                        </div>
                    </div>

                    {/* --- Xác thực OTP --- */}
                    {isSignedB && (
                        <div className="otp-section">
                            <h2>XÁC THỰC OTP</h2>
                            {!isOtpSent ? (
                                <button className="btn-primary" onClick={handleSendOtp}>
                                    Gửi OTP
                                </button>
                            ) : (
                                <div className="otp-container">
                                    <OtpInput
                                        value={otp}
                                        onChange={(val) => setOtp(val)}
                                        numInputs={6}
                                        renderSeparator={<span>-</span>}
                                        renderInput={(props) => (
                                            <input
                                                {...props}
                                                type="text"
                                                inputMode="numeric"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    margin: "0 5px",
                                                    fontSize: "18px",
                                                    borderRadius: "8px",
                                                    border: "2px solid #ddd",
                                                    textAlign: "center",
                                                    fontWeight: "600",
                                                    color: "#0f172a",
                                                }}
                                            />
                                        )}
                                    />
                                    <div className="otp-actions">
                                        <button className="btn-primary" onClick={handleVerifyOtp} disabled={otp.length !== 6}>
                                            Xác thực OTP
                                        </button>
                                        {resendTimer > 0 ? (
                                            <span>Gửi lại sau {resendTimer}s</span>
                                        ) : (
                                            <button className="btn-secondary" onClick={handleSendOtp}>
                                                Gửi lại OTP
                                            </button>
                                        )}
                                    </div>

                                    {otpMessage && <p className="otp-message success">{otpMessage}</p>}
                                    {otpError && <p className="otp-message error">{otpError}</p>}
                                    {otpVerified && (
                                        <button className="btn-primary" onClick={handleSubmitContract} disabled={isSubmitting}>
                                            {isSubmitting ? "Đang xử lý..." : "Hoàn tất hợp đồng"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

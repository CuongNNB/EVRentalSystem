import { useState, useEffect } from "react"; // Bỏ useRef
import { useParams, useLocation, useNavigate } from "react-router-dom";
// Bỏ import SignatureCanvas
import OtpInput from "react-otp-input";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ContractPage.css";

export default function ContractPage() {
    const { carId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    // Bỏ const renterSignRef = useRef(null);

    // ✅ Lấy dữ liệu forward từ BookingPage
    const { fullBooking, response, viewOnly, contract } = location.state || {};
    const storedBooking =
        fullBooking || JSON.parse(localStorage.getItem("currentBooking")) || {};

    const booking = storedBooking.bookingForm || {};
    const car = storedBooking.carData || {};
    const totals = storedBooking.totals || {};
    const user = storedBooking.user || {};
    const backendResponse = response || storedBooking.response || {};

    const bookingId = backendResponse.bookingId;
    const userEmail = user.email || backendResponse.renterEmail || "user@gmail.com";

    const [contractData] = useState(() => ({
        contractId: `EV${Date.now()}`,
        renter: {
            name: user.name || backendResponse.renterName || "Người thuê xe",
            email: userEmail,
            phone: user.phone || "Chưa cập nhật",
        },
        car: {
            name: backendResponse.vehicleModel || car.name || "Xe điện",
            price: totals.dailyPrice || backendResponse.totalAmount || 0,
            rentalDays: totals.days || 1,
            totalAmount: backendResponse.totalAmount || totals.totalRental || 0,
            deposit: totals.deposit || 0,
            station: backendResponse.stationName || car.stationName || "EV Station",
        },
        rental: {
            startDate: booking.pickupDateTime
                ? new Date(booking.pickupDateTime).toLocaleDateString("vi-VN")
                : "Hôm nay",
            endDate: booking.returnDateTime
                ? new Date(booking.returnDateTime).toLocaleDateString("vi-VN")
                : "Ngày mai",
            pickupLocation:
                booking.pickupLocation || backendResponse.stationName || "EV Station",
        },
    }));

    const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p || 0);

    const formatRentalDuration = () => {
        const dFromTotals = typeof totals.days === "number" ? totals.days : null;
        const hFromTotals = typeof totals.hours === "number" ? totals.hours : null;

        if (dFromTotals !== null && hFromTotals !== null) {
            const daysLabel = dFromTotals > 0 ? `${dFromTotals} ngày` : "";
            const hoursLabel = hFromTotals > 0 ? `${hFromTotals} giờ` : "";
            if (!daysLabel && !hoursLabel) return "Dưới 1 giờ";
            return `${daysLabel}${daysLabel && hoursLabel ? " " : ""}${hoursLabel}`.trim();
        }

        const start = booking.pickupDateTime ? new Date(booking.pickupDateTime) : null;
        const end = booking.returnDateTime ? new Date(booking.returnDateTime) : null;

        if (start && end) {
            let diffMs = end.getTime() - start.getTime();
            if (diffMs <= 0) return "Dưới 1 giờ";
            const totalHoursFloat = diffMs / (1000 * 60 * 60);
            const totalHours = Math.floor(totalHoursFloat);
            if (totalHours <= 0) return "Dưới 1 giờ";
            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;
            const daysLabel = days > 0 ? `${days} ngày` : "";
            const hoursLabel = hours > 0 ? `${hours} giờ` : "";
            if (!daysLabel && !hoursLabel) return "Dưới 1 giờ";
            return `${daysLabel}${daysLabel && hoursLabel ? " " : ""}${hoursLabel}`.trim();
        }

        if (contractData.car && typeof contractData.car.rentalDays === "number") {
            return `${contractData.car.rentalDays} ngày`;
        }

        return "---";
    };

    // ✅ Quản lý chữ ký và OTP
    const [renterSign, setRenterSign] = useState(null);
    const [ownerSign, setOwnerSign] = useState(null);
    const [isSignedB, setIsSignedB] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpMessage, setOtpMessage] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [successOverlay, setSuccessOverlay] = useState({ visible: false, message: "" });
    const [lastContractSummary, setLastContractSummary] = useState(null);

    // ✅ Chữ ký mẫu (dùng cho cả Owner và Renter khi bấm nút)
    const SAMPLE_SIGNATURE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    useEffect(() => {
        setOwnerSign(SAMPLE_SIGNATURE);
    }, []);

    useEffect(() => {
        if (viewOnly) {
            setIsSignedB(true);
            setRenterSign(SAMPLE_SIGNATURE);
        }
    }, [viewOnly]);

    useEffect(() => {
        if (resendTimer > 0) {
            const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendTimer]);

    // ✅ SỬA: Thay vì lấy từ canvas, ta set ảnh mẫu luôn
    const handleConfirmSign = () => {
        // Ở đây bạn có thể thay bằng ảnh chữ ký thật của user nếu có
        setRenterSign(SAMPLE_SIGNATURE); 
        setIsSignedB(true);
    };

    // ✅ SỬA: Bỏ dòng renterSignRef.current?.clear()
    const handleClearSign = () => {
        setRenterSign(null);
        setIsSignedB(false);
        setOtp("");
        setOtpMessage("");
        setOtpError("");
        setIsOtpSent(false);
        setOtpVerified(false);
        setResendTimer(0);
    };

    const handleSendOtp = async () => {
        if (!bookingId || !userEmail) {
            setOtpError("Không tìm thấy thông tin booking hoặc email.");
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:8084/EVRentalSystem/api/contracts/send-otp?bookingId=${bookingId}&email=${encodeURIComponent(
                    userEmail
                )}`,
                { method: "POST" }
            );

            if (!res.ok) throw new Error("Gửi OTP thất bại");

            const message = await res.text();
            setIsOtpSent(true);
            setOtpMessage(`📩 ${message}`);
            setOtpError("");
            setResendTimer(60);
        } catch (err) {
            console.error("❌ Lỗi gửi OTP:", err);
            setOtpError("Không thể gửi OTP. Vui lòng thử lại.");
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setOtpError("Nhập đủ 6 số OTP");
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:8084/EVRentalSystem/api/contracts/verify-otp?bookingId=${bookingId}&otp=${otp}`,
                { method: "POST" }
            );

            if (!res.ok) throw new Error("Xác thực OTP thất bại");

            const result = await res.text();

            if (result.toLowerCase().includes("thành công") || result.includes("success")) {
                setOtpVerified(true);
                setOtpMessage("✅ Xác thực OTP thành công!");
                setOtpError("");

                const contractSummary = {
                    contractId: contractData.contractId,
                    bookingId,
                    user,
                    car,
                    totals,
                    contractData,
                    fullBooking,
                    response: backendResponse,
                    renterSign,
                    ownerSign,
                    createdAt: new Date().toISOString(),
                    verifyMessage: result,
                };

                localStorage.setItem("currentContract", JSON.stringify(contractSummary));

                setLastContractSummary(contractSummary);
                setSuccessOverlay({
                    visible: true,
                    message: "Đã ký hợp đồng thành công, vui lòng đến đúng trạm để nhận xe",
                });

            } else {
                setOtpError("Sai OTP, vui lòng thử lại");
            }
        } catch (err) {
            console.error("Lỗi verify OTP:", err);
            setOtpError("Không thể xác thực OTP. Vui lòng thử lại.");
        }
    };

    const handleSubmitContract = () => {
        if (!otpVerified) {
            setOtpError("Cần xác thực OTP trước khi hoàn tất");
            return;
        }

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

        setLastContractSummary(contractSummary);
        setSuccessOverlay({
            visible: true,
            message: "Đã ký hợp đồng thành công, vui lòng đến đúng trạm để nhận xe",
        });
    };

    const handleConfirmOverlay = () => {
        setSuccessOverlay({ visible: false, message: "" });
        if (lastContractSummary) {
            navigate("/", { state: { contractSummary: lastContractSummary } });
        } else {
            navigate("/");
        }
    };

    const handleCloseOverlay = () => {
        setSuccessOverlay({ visible: false, message: "" });
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
                        <p>Mã đặt xe: <strong>{bookingId}</strong></p>
                    </div>

                    <div className="contract-scroll-box">
                        <div className="contract-content">
                            <h2>Điều 1: Thông tin các bên</h2>
                            <p>
                                <strong>Bên A:</strong> Công ty TNHH EV Car Rental — 123 Nguyễn Văn Cừ, Quận 5, TP.HCM.
                            </p>
                            <p>
                                <strong>Bên B:</strong> {contractData.renter.name} — SĐT:{" "}
                                {contractData.renter.phone} — Email: {contractData.renter.email}
                            </p>

                            <h2>Điều 2: Thông tin xe</h2>
                            <p><strong>Tên xe:</strong> {contractData.car.name}</p>
                            <p><strong>Trạm nhận xe:</strong> {contractData.car.station}</p>

                            <h2>Điều 3: Chi phí và thời gian</h2>
                            <p><strong>Giá thuê/ngày:</strong> {formatPrice(contractData.car.price)}₫</p>
                            <p><strong>Thời gian thuê:</strong> {formatRentalDuration()}</p>
                            <p><strong>Đặt cọc:</strong> {formatPrice(contractData.car.deposit)}₫</p>
                            <p><strong>Tổng cộng:</strong> {formatPrice(contractData.car.totalAmount)}₫</p>

                            <h2>Điều 5: Trách nhiệm khi vi phạm</h2>
                            <p>• Nếu gây hư hỏng, mất mát phụ tùng, Bên B chịu chi phí sửa chữa hoặc bồi thường thực tế theo báo giá của Bên A.</p>
                            <p>• Nếu trả xe trễ hơn thời gian quy định, Bên B phải chịu phụ thu 20% giá thuê/ngày cho mỗi ngày chậm trễ.</p>
                            <p>• Nếu Bên B vi phạm các điều khoản sử dụng xe hoặc pháp luật Việt Nam, Bên A có quyền đơn phương chấm dứt hợp đồng mà không hoàn lại tiền đặt cọc.</p>

                            <h2>Điều 6: Bảo hiểm và giới hạn quãng đường</h2>
                            <p>• Xe đã được đăng ký bảo hiểm bắt buộc dân sự, chi phí bồi thường sẽ tuân theo quy định của công ty bảo hiểm.</p>
                            <p>• Mỗi gói thuê bao gồm <strong>{contractData.car.includedKm || "không giới hạn"}</strong> km/ngày.</p>
                            <p>• Trường hợp tai nạn xảy ra do lỗi của Bên B, Bên B chịu toàn bộ chi phí khắc phục và bồi thường cho Bên A.</p>

                            <h2>Điều 7: Chấm dứt và hiệu lực hợp đồng</h2>
                            <p>• Hợp đồng có hiệu lực kể từ khi hai bên ký tên và xác thực OTP.</p>
                            <p>• Nếu một bên vi phạm nghiêm trọng các điều khoản, bên còn lại có quyền chấm dứt hợp đồng và yêu cầu bồi thường thiệt hại.</p>

                            <h2>Điều 8: Nghĩa vụ bảo dưỡng và nhiên liệu</h2>
                            <p>• Bên B có trách nhiệm kiểm tra tình trạng xe trước khi nhận và báo ngay cho Bên A nếu phát hiện lỗi kỹ thuật.</p>
                            <p>• Xe được giao trong tình trạng sạc đầy pin; Bên B cần hoàn trả xe với mức pin không thấp hơn 20%.</p>

                            <h2>Điều 9: Gia hạn và hủy hợp đồng</h2>
                            <p>• Bên B có thể gia hạn thời gian thuê xe nếu thông báo trước ít nhất 12 giờ và được Bên A chấp thuận.</p>
                            <p>• Nếu Bên B muốn hủy hợp đồng sau khi đã đặt cọc, số tiền đặt cọc sẽ không được hoàn lại.</p>

                            <h2>Điều 10: Cam kết của các bên</h2>
                            <p>• Bên A cam kết cung cấp xe đảm bảo chất lượng, an toàn và đúng thời gian đã thỏa thuận.</p>
                            <p>• Bên B cam kết cung cấp thông tin cá nhân chính xác và sử dụng xe đúng mục đích thuê.</p>
                        </div>
                    </div>

                    {/* --- Ký và OTP --- */}
                    <div className="signature-section">
                        <h2>CHỮ KÝ ĐIỆN TỬ</h2>
                        <div className="signature-grid">
                            <div className="signature-box">
                                <h3>Bên B - Người thuê xe</h3>
                                
                                {/* SỬA: Thay thế Canvas bằng Nút Ký hoặc Ảnh đã ký */}
                                {!isSignedB ? (
                                    <div className="sign-placeholder" style={{
                                        height: '150px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '8px',
                                        background: '#f8fafc',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        <p style={{color: '#64748b', margin:0}}>Vui lòng xác nhận ký hợp đồng</p>
                                        {/* Chỉ hiện nút Ký nếu không phải chế độ xem lại */}
                                        {!viewOnly && (
                                            <button 
                                                className="btn-primary" 
                                                onClick={handleConfirmSign}
                                                style={{padding: '10px 24px'}}
                                            >
                                                ✍️ Ký xác nhận
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{textAlign: 'center'}}>
                                        <img src={renterSign} alt="Chữ ký Bên B" className="signature-image" />
                                        <p style={{color: '#10b981', fontWeight: 'bold', marginTop: '8px'}}>✅ Đã ký xác nhận</p>
                                    </div>
                                )}

                                <div className="signature-actions">

                                </div>
                            </div>

                            <div className="signature-box">
                                <h3>Bên A - Công ty cho thuê</h3>
                                <img src={ownerSign} alt="Chữ ký Bên A" className="signature-image" />
                                <p>✅ Đã ký sẵn</p>
                            </div>
                        </div>
                    </div>

                    {isSignedB && !viewOnly && (
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

                {successOverlay.visible && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}>
                        <div style={{
                            background: '#fff',
                            padding: 20,
                            borderRadius: 10,
                            width: 'min(520px, 95%)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                        }}>
                            <h3 style={{ marginTop: 0 }}>Ký hợp đồng thành công</h3>
                            <p style={{ marginBottom: 18 }}>{successOverlay.message}</p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button onClick={handleCloseOverlay} style={{
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    border: '1px solid #e2e8f0',
                                    background: '#fff'
                                }}>Đóng</button>
                                <button onClick={handleConfirmOverlay} style={{
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: 'linear-gradient(135deg,#0bb97f,#06b6d4)',
                                    color: '#fff'
                                }}>Xác nhận</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
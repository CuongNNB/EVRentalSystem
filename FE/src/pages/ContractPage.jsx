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

    // ✅ Lấy dữ liệu forward từ BookingPage
    const { fullBooking, response } = location.state || {};
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

    // Overlay state for success message after signing
    const [successOverlay, setSuccessOverlay] = useState({ visible: false, message: "" });
    // store last contract summary to forward on confirm
    const [lastContractSummary, setLastContractSummary] = useState(null);

    // ✅ Ký mặc định bên A
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

    // ✅ GỬI OTP bằng API backend
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

    // ✅ XÁC THỰC OTP bằng API backend
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

                // Lưu lại vào localStorage để dự phòng
                localStorage.setItem("currentContract", JSON.stringify(contractSummary));

                // Show success overlay instead of navigate immediately
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

        // Show overlay and wait user confirmation to navigate
        setLastContractSummary(contractSummary);
        setSuccessOverlay({
            visible: true,
            message: "Đã ký hợp đồng thành công, vui lòng đến đúng trạm để nhận xe",
        });
    };

    const handleConfirmOverlay = () => {
        // close overlay and navigate to home with contractSummary in state
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
                            <p><strong>Số ngày thuê:</strong> {contractData.car.rentalDays} ngày</p>
                            <p><strong>Đặt cọc:</strong> {formatPrice(contractData.car.deposit)}₫</p>
                            <p><strong>Tổng cộng:</strong> {formatPrice(contractData.car.totalAmount)}₫</p>

                            <h2>Điều 5: Trách nhiệm khi vi phạm</h2>
                            <p>• Nếu gây hư hỏng, mất mát phụ tùng, Bên B chịu chi phí sửa chữa hoặc bồi thường thực tế theo báo giá của Bên A.</p>
                            <p>• Nếu trả xe trễ hơn thời gian quy định, Bên B phải chịu phụ thu 20% giá thuê/ngày cho mỗi ngày chậm trễ.</p>
                            <p>• Nếu Bên B vi phạm các điều khoản sử dụng xe hoặc pháp luật Việt Nam, Bên A có quyền đơn phương chấm dứt hợp đồng mà không hoàn lại tiền đặt cọc.</p>

                            <h2>Điều 6: Bảo hiểm và giới hạn quãng đường</h2>
                            <p>• Xe đã được đăng ký bảo hiểm bắt buộc dân sự, chi phí bồi thường sẽ tuân theo quy định của công ty bảo hiểm.</p>
                            <p>• Mỗi gói thuê bao gồm <strong>{contractData.car.includedKm}</strong> km/ngày. Nếu vượt quá giới hạn này, phụ thu 5.000₫/km sẽ được áp dụng.</p>
                            <p>• Trường hợp tai nạn xảy ra do lỗi của Bên B, Bên B chịu toàn bộ chi phí khắc phục và bồi thường cho Bên A.</p>

                            <h2>Điều 7: Chấm dứt và hiệu lực hợp đồng</h2>
                            <p>• Hợp đồng có hiệu lực kể từ khi hai bên ký tên và xác thực OTP.</p>
                            <p>• Nếu một bên vi phạm nghiêm trọng các điều khoản, bên còn lại có quyền chấm dứt hợp đồng và yêu cầu bồi thường thiệt hại.</p>
                            <p>• Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng; nếu không đạt thỏa thuận, vụ việc sẽ được đưa ra Tòa án Nhân dân TP.HCM.</p>

                            <h2>Điều 8: Nghĩa vụ bảo dưỡng và nhiên liệu</h2>
                            <p>• Bên B có trách nhiệm kiểm tra tình trạng xe trước khi nhận và báo ngay cho Bên A nếu phát hiện lỗi kỹ thuật.</p>
                            <p>• Xe được giao trong tình trạng sạc đầy pin; Bên B cần hoàn trả xe với mức pin không thấp hơn 20%.</p>
                            <p>• Mọi chi phí phát sinh do sử dụng sai cách hoặc không tuân thủ hướng dẫn kỹ thuật sẽ do Bên B chịu trách nhiệm.</p>

                            <h2>Điều 9: Gia hạn và hủy hợp đồng</h2>
                            <p>• Bên B có thể gia hạn thời gian thuê xe nếu thông báo trước ít nhất 12 giờ và được Bên A chấp thuận.</p>
                            <p>• Nếu Bên B muốn hủy hợp đồng sau khi đã đặt cọc, số tiền đặt cọc sẽ không được hoàn lại.</p>
                            <p>• Trường hợp bất khả kháng (thiên tai, dịch bệnh, tai nạn nghiêm trọng, v.v.) hai bên sẽ thương lượng giải pháp hợp lý.</p>

                            <h2>Điều 10: Cam kết của các bên</h2>
                            <p>• Bên A cam kết cung cấp xe đảm bảo chất lượng, an toàn và đúng thời gian đã thỏa thuận.</p>
                            <p>• Bên B cam kết cung cấp thông tin cá nhân chính xác và sử dụng xe đúng mục đích thuê.</p>
                            <p>• Hai bên cam kết tuân thủ đầy đủ các điều khoản của hợp đồng này và cùng chịu trách nhiệm trước pháp luật nếu vi phạm.</p>


                        </div>
                    </div>

                    {/* --- Ký và OTP --- */}
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

                {/* Success overlay shown after signing */}
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

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

  // ✅ Lấy dữ liệu booking từ state hoặc localStorage
  const bookingData =
    location.state || JSON.parse(localStorage.getItem("currentBooking"));

  const [contractData] = useState(() => ({
    contractId: `EV${Date.now()}`,
    renter: {
      name: bookingData?.renter?.name || "Họ và Tên",
      email: bookingData?.renter?.email || "Email người thuê",
      phone: bookingData?.renter?.phone || "Số điện thoại",
      address: "Địa chỉ",
      birthDate: "Ngày sinh",
      idNumber: "Số căn cước công dân",
      licenseNumber: "Bằng lái xe",
    },
    car: {
      name: bookingData?.car?.name || "VinFast VF e34",
      licensePlate: bookingData?.car?.licensePlate || "51A-12345",
      color: bookingData?.car?.color || "Trắng",
      price: bookingData?.pricing?.dailyRate || 1000000,
      rentalDays: bookingData?.rental?.days || 1,
      totalAmount: bookingData?.pricing?.subtotal || 1000000,
      deposit: bookingData?.pricing?.deposit || 300000,
      includedKm: 200,
    },
    rental: {
      startDate: bookingData?.rental?.pickupDate
        ? new Date(bookingData.rental.pickupDate).toLocaleDateString("vi-VN")
        : "Hôm nay",
      endDate: bookingData?.rental?.returnDate
        ? new Date(bookingData.rental.returnDate).toLocaleDateString("vi-VN")
        : "Ngày mai",
      startTime: bookingData?.rental?.pickupDate
        ? new Date(bookingData.rental.pickupDate).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "12:00",
      endTime: bookingData?.rental?.returnDate
        ? new Date(bookingData.rental.returnDate).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "12:00",
      pickupLocation:
        bookingData?.rental?.pickupLocation || "EV Station - Bình Thạnh",
    },
  }));

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

  // ✅ Chữ ký mẫu cho Bên A
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

  const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p);

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

  // ✅ Demo OTP
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

  // ✅ Gom toàn bộ dữ liệu cần chuyển
  const contractSummary = {
    contractId: contractData.contractId,
    contractData,
    bookingData,
    renterSign,
    ownerSign,
    createdAt: new Date().toISOString(),
  };

  // ✅ Lưu localStorage dự phòng
  localStorage.setItem("currentContract", JSON.stringify(contractSummary));

  // ✅ Forward sang DepositPaymentPage qua state
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
          {/* --- Tiêu đề --- */}
          <div className="contract-header">
            <h1>HỢP ĐỒNG THUÊ XE Ô TÔ</h1>
            <h1>#{contractData.contractId}</h1>
            <p>
              Ngày lập: <strong>{currentDateTime}</strong>
            </p>
          </div>

          {/* --- Ô cuộn nội dung chính --- */}
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
              <p>
                <strong>Tên xe:</strong> {contractData.car.name}
              </p>
              <p>
                <strong>Màu sắc:</strong> {contractData.car.color}
              </p>

              <h2>Điều 3: Thời gian và chi phí</h2>
              <p>
                <strong>Thời gian thuê:</strong> Từ {contractData.rental.startDate} lúc{" "}
                {contractData.rental.startTime} đến {contractData.rental.endDate} lúc{" "}
                {contractData.rental.endTime}
              </p>
              <p>
                <strong>Địa điểm nhận xe:</strong> {contractData.rental.pickupLocation}
              </p>
              <p>
                <strong>Giá thuê/ngày:</strong> {formatPrice(contractData.car.price)}₫
              </p>
              <p>
                <strong>Đặt cọc:</strong> {formatPrice(contractData.car.deposit)}₫ (30% giá trị thuê)
              </p>
              <p>
                <strong>Tổng cộng:</strong> {formatPrice(contractData.car.totalAmount)}₫
              </p>

              {/* --- Các điều khoản khôi phục --- */}
              <h2>Điều 4: Quy định sử dụng</h2>
              <p>• Bên B phải sử dụng xe đúng mục đích, không cho thuê lại, không dùng vào hoạt động trái pháp luật.</p>
              <p>• Xe phải được bảo quản cẩn thận, không tự ý sửa chữa khi chưa có sự đồng ý của Bên A.</p>

              <h2>Điều 5: Trách nhiệm khi vi phạm</h2>
              <p>• Nếu gây hư hỏng, mất mát phụ tùng, Bên B chịu chi phí sửa chữa hoặc bồi thường thực tế.</p>
              <p>• Nếu trả xe trễ hơn thời gian quy định: phụ thu 20% giá thuê/ngày.</p>

              <h2>Điều 6: Bảo hiểm và giới hạn quãng đường</h2>
              <p>• Xe đã được đăng ký bảo hiểm bắt buộc dân sự.</p>
              <p>• Gói thuê bao gồm {contractData.car.includedKm} km/ngày, vượt quá sẽ tính phí 5,000₫/km.</p>

              <h2>Điều 7: Chấm dứt và hiệu lực hợp đồng</h2>
              <p>• Hợp đồng có hiệu lực kể từ khi hai bên ký tên và xác thực OTP.</p>
              <p>• Nếu một bên vi phạm nghiêm trọng điều khoản, bên còn lại có quyền chấm dứt hợp đồng.</p>
              <p>• Mọi tranh chấp sẽ được giải quyết tại Tòa án Nhân dân TP.HCM.</p>
            </div>
          </div>

          {/* --- Phần chữ ký --- */}
          <div className="signature-section">
            <h2>CHỮ KÝ ĐIỆN TỬ</h2>
            <div className="signature-grid">
              <div className="signature-box">
                <h3>Bên B - Bên thuê xe</h3>
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
                <h3>Bên A - Bên cho thuê</h3>
                <img src={ownerSign} alt="Chữ ký Bên A" className="signature-image" />
                <p>✅ Đã ký sẵn</p>
              </div>
            </div>
          </div>

          {/* --- OTP Section mới nhất --- */}
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

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import OtpInput from "react-otp-input";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ContractPage.css";

export default function ContractPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  
  // Refs cho canvas ký
  const renterSignRef = useRef(null);
  
  // State cho hợp đồng
  const [contractData, setContractData] = useState({
    contractId: `CT${Date.now()}`,
    renter: {
      name: "Nguyễn Văn A",
      email: "xxx@gmail.com",
      phone: "0987654321",
      address: "456 Đường ABC, Quận 1, TP.HCM",
      birthDate: "01/01/1990",
      idNumber: "123456789",
      licenseNumber: "B1-123456"
    },
    car: {
      name: "VinFast VF 3",
      licensePlate: "51A-12345",
      color: "Trắng",
      price: 1000000,
      rentalDays: 1,
      totalAmount: 1000000,
      deposit: 300000,
      includedKm: 200
    },
    rental: {
      startDate: "29/09/2025",
      endDate: "30/09/2025",
      startTime: "12:00",
      endTime: "12:00",
      pickupLocation: "EV Station - Bình Thạnh"
    }
  });
  
  // State cho chữ ký
  const [renterSign, setRenterSign] = useState(null);
  const [ownerSign, setOwnerSign] = useState(null);
  const [isSignedB, setIsSignedB] = useState(false);
  
  // State cho OTP
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tự động load chữ ký mẫu cho Bên A khi component mount
  useEffect(() => {
    // Chữ ký mẫu cho Bên A (base64 hoặc URL ảnh)
    const ownerSignatureSample = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    setOwnerSign(ownerSignatureSample);
  }, []);

  // Đếm ngược resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  
  // Gửi OTP
  const handleSendOtp = async () => {
    try {
      setOtpMessage('Đang gửi OTP...');
      setOtpError('');
      
      // Gọi API POST /contracts/:id/otp/send
      const response = await fetch(`/api/contracts/${contractId}/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contractData.renter.email
        })
      });

      if (response.ok) {
        setIsOtpSent(true);
        setOtpMessage('OTP đã được gửi tới email của bạn.');
        setOtpError('');
        setResendTimer(60);
        
        // Auto scroll xuống phần OTP sau khi gửi thành công
        setTimeout(() => {
          const otpSection = document.querySelector('.otp-section');
          if (otpSection) {
            otpSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500);
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Không thể gửi OTP, vui lòng thử lại');
      setOtpMessage('');
    }
  };
  
  // Xác thực OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    try {
      // Gọi API POST /contracts/:id/otp/verify
      const response = await fetch(`/api/contracts/${contractId}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: otp
        })
      });

      if (response.ok) {
        setOtpVerified(true);
        setOtpMessage('✅ OTP xác thực thành công');
        setOtpError('');
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('OTP không đúng, vui lòng thử lại');
    }
  };
  
  // Xử lý ký tên Bên B
  const handleConfirmSign = async () => {
    if (renterSignRef.current) {
      const signatureData = renterSignRef.current.toDataURL();
      setRenterSign(signatureData);
      setIsSignedB(true);
      
      // Demo: Chuyển thẳng đến trang thanh toán sau khi ký
      setTimeout(() => {
        navigate(`/contract/${contractId}/payment`);
      }, 1000);
    }
  };

  // Xóa chữ ký Bên B
  const handleClearSign = () => {
    if (renterSignRef.current) {
      renterSignRef.current.clear();
      setRenterSign(null);
      setIsSignedB(false);
      
      // Reset OTP state khi xóa chữ ký
      setIsOtpSent(false);
      setOtpVerified(false);
      setOtp('');
      setOtpError('');
      setOtpMessage('');
      setResendTimer(0);
    }
  };
  
  // Xác nhận chữ ký
  const confirmSignature = (type) => {
    if (type === "renter") {
      const dataUrl = renterCanvasRef.current?.getTrimmedCanvas().toDataURL();
      if (dataUrl) {
        setRenterSign(dataUrl);
        setRenterSigned(true);
      }
    } else {
      const dataUrl = ownerCanvasRef.current?.getTrimmedCanvas().toDataURL();
      if (dataUrl) {
        setOwnerSign(dataUrl);
        setOwnerSigned(true);
      }
    }
  };
  
  // Hoàn tất hợp đồng
  const handleSubmitContract = async () => {
    if (!renterSign || !ownerSign) {
      setOtpError('Vui lòng ký đủ hai bên trước khi hoàn tất');
      return;
    }

    if (!otpVerified) {
      setOtpError('Vui lòng xác thực OTP trước khi hoàn tất');
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi API POST /contracts/:id/submit
      const response = await fetch(`/api/contracts/${contractId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          renterSignature: renterSign,
          ownerSignature: ownerSign,
          otp: otp,
          renterInfo: contractData.renter,
          carInfo: contractData.car,
          rentalInfo: contractData.rental,
          contractContent: "Nội dung hợp đồng đầy đủ"
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Hợp đồng đã lưu thành công! PDF: ${result.pdfUrl}`);
        navigate(`/contract/${contractId}/payment`);
      } else {
        throw new Error('Failed to submit contract');
      }
    } catch (error) {
      console.error('Error submitting contract:', error);
      setOtpError('Có lỗi xảy ra khi lưu hợp đồng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="contract-page">
      <Header />
      
      <main className="contract-main">
        <div className="contract-container">
          {/* Tiêu đề hợp đồng */}
          <div className="contract-header">
            <h1 className="contract-title">
              HỢP ĐỒNG THUÊ XE Ô TÔ – MÃ #{contractData.contractId}
            </h1>
            <p className="contract-subtitle">
              Được lập ngày {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Nội dung hợp đồng */}
          <div className="contract-content">
            <div className="contract-body">
              <h2>ĐIỀU 1: CÁC BÊN THAM GIA</h2>
              <p><strong>Bên A (Bên cho thuê):</strong></p>
              <p>Tên: Công ty TNHH EV Car Rental</p>
              <p>Địa chỉ: 123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM</p>
              <p>Điện thoại: 1900-1234</p>
              <p>Email: contact@evcarrental.vn</p>
              <p>Đại diện: Ông Trần Văn Nam - Giám đốc</p>
              
              <p><strong>Bên B (Bên thuê xe):</strong></p>
              <p>Họ tên: {contractData.renter.name}</p>
              <p>Ngày sinh: {contractData.renter.birthDate}</p>
              <p>CCCD/CMND số: {contractData.renter.idNumber}</p>
              <p>Địa chỉ: {contractData.renter.address}</p>
              <p>Điện thoại: {contractData.renter.phone}</p>
              <p>Giấy phép lái xe: Hạng B1, số {contractData.renter.licenseNumber}</p>
              
              <h2>ĐIỀU 2: THÔNG TIN XE THUÊ</h2>
              <p><strong>Loại xe:</strong> {contractData.car.name}</p>
              <p><strong>Biển số:</strong> {contractData.car.licensePlate}</p>
              <p><strong>Màu sắc:</strong> {contractData.car.color}</p>
              <p><strong>Tình trạng bàn giao:</strong> Xe trong tình trạng tốt, đầy đủ phụ kiện (có biên bản kèm ảnh)</p>
              
              <h2>ĐIỀU 3: THỜI GIAN VÀ GIÁ THUÊ</h2>
              <p><strong>Thời gian thuê:</strong> Từ {contractData.rental.startDate} {contractData.rental.startTime} đến {contractData.rental.endDate} {contractData.rental.endTime}</p>
              <p><strong>Giá thuê:</strong> {formatPrice(contractData.car.price)} VNĐ/ngày (đã bao gồm {contractData.car.includedKm} km)</p>
              <p><strong>Đặt cọc:</strong> {formatPrice(contractData.car.deposit)} VNĐ ({Math.round((contractData.car.deposit / contractData.car.price) * 100)}% giá thuê)</p>
              <p><strong>Phương thức thanh toán:</strong> Chuyển khoản/Tiền mặt</p>
              
              <h2>ĐIỀU 4: QUY ĐỊNH VỀ SỬ DỤNG VÀ TRẢ XE</h2>
              <p><strong>1. Trả xe sai trạm</strong></p>
              <p>Nếu Bên B trả xe không đúng trạm, sẽ tính phí quãng đường từ trạm quy định đến nơi trả thực tế: 1 km = 20,000 VNĐ</p>
              
              <p><strong>2. Giới hạn quãng đường</strong></p>
              <p>• Gói thuê đã bao gồm {contractData.car.includedKm} km/ngày</p>
              <p>• Nếu vượt quá: mỗi km vượt = 50,000 VNĐ</p>
              
              <p><strong>3. Phí vệ sinh</strong></p>
              <p>Xe trả trong tình trạng bẩn bất thường (bùn đất, mùi, rác thải...) sẽ tính phí vệ sinh: 300,000 – 500,000 VNĐ tùy mức độ</p>
              
              <p><strong>4. Hư hỏng xe</strong></p>
              <p>• Nếu xe bị hư hỏng do lỗi của Bên B → Bên B phải bồi thường chi phí sửa chữa thực tế</p>
              <p>• Nếu mất mát phụ tùng, trang thiết bị → bồi thường theo giá trị thị trường</p>
              
              <p><strong>5. Nhiên liệu/sạc pin</strong></p>
              <p>Bên B phải sạc đủ mức tối thiểu 80% trước khi trả xe. Nếu không, tính phí sạc bổ sung: 200,000 VNĐ</p>
              
              <h2>ĐIỀU 5: NGHĨA VỤ CỦA CÁC BÊN</h2>
              <p><strong>Bên A (Cho thuê):</strong></p>
              <p>• Giao xe đúng loại, đúng tình trạng</p>
              <p>• Hỗ trợ kỹ thuật 24/7</p>
              <p>• Cung cấp bảo hiểm xe</p>
              
              <p><strong>Bên B (Thuê):</strong></p>
              <p>• Sử dụng xe đúng mục đích, hợp pháp</p>
              <p>• Tuân thủ luật giao thông</p>
              <p>• Không cho thuê lại</p>
              <p>• Trả xe đúng thời gian, đúng trạm</p>
              
              <h2>ĐIỀU 6: VI PHẠM VÀ CHẤM DỨT HỢP ĐỒNG</h2>
              <p>• Bên B trả xe trễ → phụ thu 20% giá thuê/ngày</p>
              <p>• Nếu Bên B vi phạm các điều khoản trên, Bên A có quyền chấm dứt hợp đồng và thu hồi xe</p>
              <p>• Tranh chấp được giải quyết thông qua thương lượng hoặc tại Tòa án có thẩm quyền</p>
              
              <h2>ĐIỀU 7: HIỆU LỰC HỢP ĐỒNG</h2>
              <p>• Hợp đồng có hiệu lực từ ngày ký</p>
              <p>• Lập thành 02 bản điện tử, mỗi bên giữ 01 bản, có giá trị pháp lý như nhau</p>
              <p>• Hợp đồng được xác nhận bằng chữ ký điện tử và mã OTP</p>
              </div>
            </div>

          {/* Phần ký tay điện tử */}
          <div className="signature-section">
            <h2>CHỮ KÝ ĐIỆN TỬ</h2>
            <div className="signature-container">
              {/* Bên thuê xe */}
              <div className="signature-box">
                <h3>Bên B - Bên thuê xe</h3>
                <div className="signature-canvas-container">
                  {!isSignedB ? (
                    <SignatureCanvas
                      ref={renterSignRef}
                      canvasProps={{
                        width: 300,
                        height: 150,
                        className: "signature-canvas"
                      }}
                    />
                  ) : (
                    <div className="signature-display">
                      <img src={renterSign} alt="Chữ ký bên thuê" />
                      <p className="signed-status">✅ Đã ký</p>
                </div>
                  )}
                </div>
                <div className="signature-actions">
                  {!isSignedB ? (
                    <>
                      <button 
                        className="btn-clear" 
                        onClick={handleClearSign}
                      >
                        Xóa ký
                      </button>
                      <button 
                        className="btn-confirm" 
                        onClick={handleConfirmSign}
                      >
                        Xác nhận ký
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn-clear" 
                      onClick={handleClearSign}
                    >
                      Ký lại
                    </button>
                  )}
              </div>
            </div>

              {/* Bên cho thuê */}
              <div className="signature-box">
                <h3>Bên A - Bên cho thuê</h3>
                <div className="signature-canvas-container">
                  <div className="signature-display">
                    <img src={ownerSign} alt="Chữ ký bên cho thuê" />
                    <p className="signed-status">✅ Đã ký sẵn</p>
                </div>
                </div>
                <div className="signature-actions">
                  <p className="signature-note">Chữ ký mẫu đã được ký sẵn</p>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Phần OTP xác thực */}
          {isSignedB && (
            <div className="otp-section">
              <h2>XÁC THỰC OTP</h2>
              <div className="otp-container">
                <p>Vui lòng nhập mã OTP đã được gửi tới email của bạn để xác thực hợp đồng.</p>
                
                {!isOtpSent ? (
                  <div className="otp-send">
                    <button 
                      className="btn-primary" 
                      onClick={handleSendOtp}
                      disabled={isSubmitting}
                    >
                      Gửi OTP
                    </button>
                  </div>
                ) : (
                  <div className="otp-verify">
                    <div className="otp-input-container">
                      <label>Nhập mã OTP (6 số):</label>
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={6}
                        separator={<span>-</span>}
                        inputStyle={{
                          width: "40px",
                          height: "40px",
                          margin: "0 5px",
                          fontSize: "18px",
                          borderRadius: "8px",
                          border: "2px solid #ddd",
                          textAlign: "center"
                        }}
                        focusStyle={{
                          border: "2px solid #10b981",
                          outline: "none"
                        }}
                        isInputNum={true}
                        shouldAutoFocus={true}
                      />
                    </div>
                    
                    <div className="otp-actions">
                      <button 
                        className="btn-primary" 
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6 || isSubmitting}
                      >
                        Xác thực OTP
                      </button>
                      
                      {resendTimer > 0 ? (
                        <span className="resend-timer">
                          Gửi lại sau {resendTimer}s
                        </span>
                      ) : (
                        <button 
                          className="btn-secondary" 
                          onClick={handleSendOtp}
                          disabled={isSubmitting}
                        >
                          Gửi lại OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {otpMessage && (
                  <div className="otp-message success">
                    {otpMessage}
                  </div>
                )}
                
                {otpError && (
                  <div className="otp-message error">
                    {otpError}
                  </div>
                )}
                
                {otpVerified && (
                  <div className="otp-success">
                    <h3>✅ OTP đã được xác thực thành công!</h3>
                    <p>Bạn có thể hoàn tất hợp đồng.</p>
                    <button 
                      className="btn-primary" 
                      onClick={handleSubmitContract}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang xử lý..." : "Hoàn tất hợp đồng"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
      </main>

      <Footer />
    </div>
  );
}
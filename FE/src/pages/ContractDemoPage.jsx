import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SignaturePad from '../components/SignaturePad';
import OtpSection from '../components/OtpSection';
import SuccessCard from '../components/SuccessCard';
import './ContractDemoPage.css';

const ContractDemoPage = () => {
  const navigate = useNavigate();
  const [signed, setSigned] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [contractData, setContractData] = useState(null);

  // Lưu trạng thái vào localStorage để demo
  useEffect(() => {
    const savedState = localStorage.getItem('contractDemoState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setSigned(state.signed || false);
      setOtpSent(state.otpSent || false);
      setVerified(state.verified || false);
      setSignatureData(state.signatureData || null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('contractDemoState', JSON.stringify({
      signed,
      otpSent,
      verified,
      signatureData
    }));
  }, [signed, otpSent, verified, signatureData]);

  const handleSignatureChange = (data) => {
    setSignatureData(data);
    setSigned(!!data);
  };

  const handleOtpVerified = () => {
    setVerified(true);
    setOtpSent(true);
    
    // Tạo dữ liệu hợp đồng demo
    const contract = {
      contractId: `HD2025-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      signedAt: new Date().toLocaleString('vi-VN'),
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nguyenvana@email.com'
    };
    
  setContractData(contract);
  // Lưu dữ liệu hợp đồng tạm để trang thông tin khách hàng có thể tham chiếu nếu cần
  localStorage.setItem('last_contract_demo', JSON.stringify(contract));
    
    // Chuyển đến trang thông tin khách hàng sau 2 giây
    setTimeout(() => {
      navigate('/customer-info');
    }, 2000);
  };

  const handleReset = () => {
    setSigned(false);
    setOtpSent(false);
    setVerified(false);
    setSignatureData(null);
    setContractData(null);
    localStorage.removeItem('contractDemoState');
  };
//  Hiển thị trang thành công nếu đã ký và xác thực OTP
  if (verified && contractData) {
    return (
      <div className="contract-demo-page">
        <Header />
        <div className="demo-container">
          <div className="success-transition">
            <div className="success-icon">
              <div className="checkmark-animation">
                <svg viewBox="0 0 24 24" fill="none" className="checkmark-svg">
                  <path 
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h2>✅ Hợp đồng đã được ký thành công!</h2>
            <p>Đang chuyển đến trang thông tin khách hàng để xác nhận chi tiết...</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="contract-demo-page">
      <Header />
      
      <div className="demo-container">
        {/* Page Header */}
        <div className="demo-header">
          <h1 className="demo-title">KÝ HỢP ĐỒNG THUÊ XE ĐIỆN</h1>
          <p className="demo-subtitle">
            Xác nhận hợp đồng thuê xe bằng chữ ký điện tử và mã OTP gửi về email của bạn.
          </p>
        </div>

        {/* Signature Section */}
        <div className="signature-section">
          <div className="signature-confirm-wrapper">
            {/* Bên A - Bên cho thuê (Khách hàng xác nhận) */}
            <div className="signature-confirm-card">
              <h3>Bên A - Bên cho thuê (Khách hàng)</h3>
              <p className="signature-subtitle">Xác nhận ký hợp đồng thuê xe</p>
              
              <div className="confirm-box">
                {!signed ? (
                  <div className="confirm-content">
                    <div className="confirm-icon">📝</div>
                    <p className="confirm-text">
                      Bằng việc nhấn nút bên dưới, bạn xác nhận đã đọc và đồng ý với các điều khoản trong hợp đồng thuê xe.
                    </p>
                    <button 
                      className="btn-confirm-signature"
                      onClick={() => setSigned(true)}
                    >
                      ✓ Xác nhận ký hợp đồng
                    </button>
                  </div>
                ) : (
                  <div className="signed-status">
                    <div className="checkmark-circle">✓</div>
                    <p className="signed-text">Đã xác nhận ký</p>
                    <p className="signed-time">{new Date().toLocaleString('vi-VN')}</p>
                    <button 
                      className="btn-reset-signature"
                      onClick={() => setSigned(false)}
                    >
                      Ký lại
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* OTP Section */}
        <OtpSection
          onOtpVerified={handleOtpVerified}
          isDisabled={!signed}
        />

        {/* Demo Info */}
        <div className="demo-info">
          <div className="info-card">
            <h3>📋 Hướng dẫn demo</h3>
            <ol>
              <li><strong>Bước 1:</strong> Nhấn nút "Xác nhận ký hợp đồng"</li>
              <li><strong>Bước 2:</strong> Nhấn "Gửi OTP" để nhận mã xác thực</li>
              <li><strong>Bước 3:</strong> Nhập mã OTP (sẽ hiển thị trong alert)</li>
              <li><strong>Bước 4:</strong> Xem kết quả xác thực thành công</li>
            </ol>
          </div>
          
          <div className="info-card">
            <h3>🔧 Tính năng demo</h3>
            <ul>
              <li>✅ Xác nhận ký đơn giản bằng nút bấm</li>
              <li>✅ Chỉ cần khách hàng (bên cho thuê) xác nhận</li>
              <li>✅ Gửi OTP giả lập với mã ngẫu nhiên</li>
              <li>✅ Xác thực OTP với animation</li>
              <li>✅ Hiển thị kết quả cuối cùng</li>
              <li>✅ Responsive design cho mobile</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContractDemoPage;

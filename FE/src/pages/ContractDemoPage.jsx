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
    
    // Chuyển đến trang thanh toán sau 2 giây
    setTimeout(() => {
      navigate('/checkout');
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
            <p>Đang chuyển đến trang thanh toán...</p>
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
          <div className="signature-grid">
            {/* Bên B - Bên thuê xe */}
            <SignaturePad
              title="Bên B - Bên thuê xe"
              subtitle="Vui lòng ký vào khung bên dưới"
              onSignatureChange={handleSignatureChange}
              isReadOnly={false}
              isPreSigned={false}
            />
            
            {/* Bên A - Bên cho thuê */}
            <SignaturePad
              title="Bên A - Bên cho thuê"
              subtitle="Chữ ký mẫu đã được ký sẵn"
              onSignatureChange={() => {}}
              isReadOnly={true}
              isPreSigned={true}
            />
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
              <li><strong>Bước 1:</strong> Ký vào khung "Bên B - Bên thuê xe" bằng chuột hoặc touch</li>
              <li><strong>Bước 2:</strong> Nhấn "Gửi OTP" để nhận mã xác thực</li>
              <li><strong>Bước 3:</strong> Nhập mã OTP (sẽ hiển thị trong alert)</li>
              <li><strong>Bước 4:</strong> Xem kết quả xác thực thành công</li>
            </ol>
          </div>
          
          <div className="info-card">
            <h3>🔧 Tính năng demo</h3>
            <ul>
              <li>✅ Chữ ký điện tử thực tế trên canvas</li>
              <li>✅ Lưu trữ chữ ký vào localStorage</li>
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

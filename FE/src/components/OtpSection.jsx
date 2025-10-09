import React, { useState } from 'react';
import './OtpSection.css';

const OtpSection = ({ onOtpVerified, isDisabled = false }) => {
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOtp = async () => {
    if (isDisabled) return;
    
    setIsLoading(true);
    setError('');
    
    // Mô phỏng delay gửi OTP
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setOtpSent(true);
    setIsLoading(false);
    
    // Hiển thị OTP trong alert để demo
    alert(`Mã OTP đã được gửi tới email của bạn: ${newOtp}\n\n(Đây là demo - trong thực tế OTP sẽ được gửi qua email)`);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }

    if (otp === generatedOtp) {
      setIsVerified(true);
      setError('');
      onOtpVerified();
    } else {
      setError('Mã OTP không đúng, vui lòng thử lại');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');
    setOtp('');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setIsLoading(false);
    
    alert(`Mã OTP mới đã được gửi: ${newOtp}\n\n(Đây là demo - trong thực tế OTP sẽ được gửi qua email)`);
  };

  return (
    <div className="otp-section">
      <div className="otp-header">
        <h3 className="otp-title">XÁC THỰC OTP</h3>
        <p className="otp-description">
          Vui lòng nhập mã OTP đã được gửi tới email của bạn để xác thực hợp đồng.
        </p>
      </div>

      <div className="otp-content">
        {!otpSent ? (
          <div className="otp-send-section">
            <button
              onClick={handleSendOtp}
              disabled={isDisabled || isLoading}
              className={`send-otp-btn ${isDisabled ? 'disabled' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Đang gửi OTP...
                </>
              ) : (
                'Gửi OTP'
              )}
            </button>
            
            {isDisabled && (
              <p className="disabled-message">
                Vui lòng ký hợp đồng trước khi gửi OTP
              </p>
            )}
          </div>
        ) : (
          <div className="otp-verify-section">
            <div className="otp-input-wrapper">
              <label htmlFor="otp-input" className="otp-label">
                Nhập mã OTP (6 chữ số):
              </label>
              <input
                id="otp-input"
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength={6}
                className={`otp-input ${isShaking ? 'shake' : ''} ${isVerified ? 'verified' : ''}`}
                disabled={isVerified}
              />
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              {isVerified && (
                <div className="success-message">
                  ✅ Xác thực thành công! Hợp đồng đã được ký.
                </div>
              )}
            </div>

            <div className="otp-actions">
              {!isVerified && (
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6}
                  className="verify-btn"
                >
                  Xác thực OTP
                </button>
              )}
              
              <button
                onClick={handleResendOtp}
                disabled={isLoading || isVerified}
                className="resend-btn"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi lại OTP'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtpSection;

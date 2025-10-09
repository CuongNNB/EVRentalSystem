import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessCard.css';

const SuccessCard = ({ contractData }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewContract = () => {
    // Trong thực tế, đây sẽ mở modal hoặc chuyển đến trang xem hợp đồng
    alert('Tính năng xem hợp đồng sẽ được triển khai trong phiên bản đầy đủ');
  };

  const handleDownloadContract = () => {
    // Trong thực tế, đây sẽ tải file PDF hợp đồng
    alert('Tính năng tải hợp đồng PDF sẽ được triển khai trong phiên bản đầy đủ');
  };

  return (
    <div className="success-card">
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

      <div className="success-content">
        <h2 className="success-title">✅ HỢP ĐỒNG ĐÃ ĐƯỢC XÁC THỰC</h2>
        <p className="success-description">
          Hợp đồng thuê xe điện đã được ký và xác thực thành công. 
          Thông tin chi tiết đã được gửi tới email của bạn.
        </p>

        <div className="contract-info">
          <div className="info-row">
            <span className="info-label">Mã hợp đồng:</span>
            <span className="info-value">{contractData.contractId}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Thời gian ký:</span>
            <span className="info-value">{contractData.signedAt}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Tên khách hàng:</span>
            <span className="info-value">{contractData.customerName}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{contractData.customerEmail}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Trạng thái:</span>
            <span className="status-badge verified">Đã xác thực</span>
          </div>
        </div>

        <div className="success-actions">
          <button onClick={handleViewContract} className="action-btn primary">
            📋 Xem hợp đồng
          </button>
          
          <button onClick={handleDownloadContract} className="action-btn secondary">
            📄 Tải hợp đồng PDF
          </button>
          
          <button onClick={handleGoHome} className="action-btn home">
            🏠 Quay lại trang chủ
          </button>
        </div>

        <div className="next-steps">
          <h4>Bước tiếp theo:</h4>
          <ul>
            <li>Kiểm tra email để nhận bản sao hợp đồng</li>
            <li>Chuẩn bị giấy tờ tùy thân khi nhận xe</li>
            <li>Liên hệ hotline nếu cần hỗ trợ: <strong>1900-1234</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuccessCard;

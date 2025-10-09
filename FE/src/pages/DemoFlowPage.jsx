import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DemoFlowPage.css';

const DemoFlowPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      title: "Ký hợp đồng điện tử",
      description: "Ký chữ ký điện tử và xác thực OTP",
      action: "Bắt đầu ký hợp đồng",
      route: "/contract-demo",
      icon: "✍️"
    },
    {
      number: 2,
      title: "Thanh toán",
      description: "Điền thông tin và hoàn tất thanh toán",
      action: "Tiến hành thanh toán",
      route: "/checkout",
      icon: "💳"
    },
    {
      number: 3,
      title: "Xác nhận hoàn tất",
      description: "Xem kết quả cuối cùng",
      action: "Xem kết quả",
      route: "/checkout/success?bookingId=123456",
      icon: "🎉"
    }
  ];

  return (
    <div className="demo-flow-page">
      <Header />
      
      <div className="demo-flow-container">
        <div className="demo-flow-header">
          <h1>🚀 Demo Flow Hoàn Chỉnh</h1>
          <p>Trải nghiệm toàn bộ quy trình từ ký hợp đồng đến thanh toán thành công</p>
        </div>

        <div className="flow-steps">
          {steps.map((step, index) => (
            <div key={step.number} className="flow-step">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <button 
                  onClick={() => navigate(step.route)}
                  className="step-button"
                >
                  {step.action}
                </button>
              </div>
              {index < steps.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>

        <div className="demo-info">
          <h3>📋 Hướng dẫn demo</h3>
          <ol>
            <li><strong>Bước 1:</strong> Click "Bắt đầu ký hợp đồng" → Ký chữ ký → Nhập OTP → Chờ chuyển trang</li>
            <li><strong>Bước 2:</strong> Điền thông tin khách hàng → Chọn add-ons → Click "Hoàn tất thanh toán"</li>
            <li><strong>Bước 3:</strong> Xem kết quả cuối cùng với thông báo hoàn tất hợp đồng và thanh toán</li>
          </ol>
        </div>

        <div className="demo-features">
          <h3>✨ Tính năng demo</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🖊️ Chữ ký điện tử</h4>
              <ul>
                <li>Canvas drawing thực tế</li>
                <li>Lưu trữ localStorage</li>
                <li>Animation mượt mà</li>
              </ul>
            </div>
            <div className="feature-card">
              <h4>📱 Xác thực OTP</h4>
              <ul>
                <li>Gửi OTP giả lập</li>
                <li>Validation realtime</li>
                <li>Error handling</li>
              </ul>
            </div>
            <div className="feature-card">
              <h4>💳 Thanh toán</h4>
              <ul>
                <li>Form validation</li>
                <li>Upload documents</li>
                <li>Order summary</li>
              </ul>
            </div>
            <div className="feature-card">
              <h4>🎉 Kết quả</h4>
              <ul>
                <li>Thông báo hoàn tất</li>
                <li>Trạng thái đầy đủ</li>
                <li>Actions tiếp theo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DemoFlowPage;

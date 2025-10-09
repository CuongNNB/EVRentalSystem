import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, formatBookingId, generateQRData } from '../utils/format';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Mock data for demo
  useEffect(() => {
    const mockBookingData = {
      bookingId: searchParams.get('bookingId') || 'BK_199630',
      status: 'paid',
      customer: {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '+84901234567'
      },
      carInfo: {
        name: 'Genesis GV60 Performance',
        year: 2023,
        licensePlate: '30A-12345',
        image: '/src/anhxe/Genesis GV60 Performance.jpg'
      },
      dates: {
        pickup: '2025-01-15T09:00:00+07:00',
        dropoff: '2025-01-17T09:00:00+07:00',
        days: 2
      },
      locations: {
        pickup: {
          address: '123 Nguyễn Huệ, Q1, TP.HCM',
          coordinates: '10.7769,106.7009'
        },
        dropoff: {
          address: '123 Nguyễn Huệ, Q1, TP.HCM',
          coordinates: '10.7769,106.7009'
        }
      },
      pricing: {
        totalToday: 1080000,
        holdDeposit: 3000000,
        totalAtReturn: 0,
        currency: 'VND'
      }
    };
    
    setBookingData(mockBookingData);
  }, [searchParams]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'ĐÃ THANH TOÁN';
      case 'pending': return 'CHỜ XÁC NHẬN';
      case 'failed': return 'THẤT BẠI';
      default: return 'KHÔNG XÁC ĐỊNH';
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleCheckPaymentStatus = async () => {
    setCheckingPayment(true);
    // Simulate API call
    setTimeout(() => {
      setCheckingPayment(false);
    }, 2000);
  };

  const handleDownloadInvoice = () => {
    // Mock download
    console.log('Downloading invoice...');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleViewContract = () => {
    navigate('/contract-demo');
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(bookingData.dates.pickup);
    const endDate = new Date(bookingData.dates.dropoff);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EV Rental//Booking//EN
BEGIN:VEVENT
UID:${bookingData.bookingId}@evrental.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Thuê xe ${bookingData.carInfo.name}
DESCRIPTION:Đặt xe ${bookingData.bookingId} - ${bookingData.carInfo.name}
LOCATION:${bookingData.locations.pickup.address}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking-${bookingData.bookingId}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Đặt xe ${bookingData.bookingId}`,
        text: `Tôi vừa đặt xe ${bookingData.carInfo.name} thành công!`,
        url: window.location.href
      });
    } else {
      copyToClipboard(window.location.href);
    }
  };

  if (!bookingData) {
    return (
      <div className="payment-success-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin đặt xe...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <Header />
      
      <div className="success-container">
        {/* Hero Section */}
        <motion.div 
          className="success-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="checkmark">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>
          <h1>Hoàn tất thành công!</h1>
          <p>
            <strong>Hợp đồng đã được ký</strong> và <strong>thanh toán thành công</strong>!<br/>
            Mã đặt xe của bạn là <strong>{formatBookingId(bookingData.bookingId)}</strong>. 
            Chúng tôi đã gửi xác nhận tới <strong>{bookingData.customer.email}</strong>. 
            Vui lòng kiểm tra hộp thư hoặc mục <em>Spam</em>.
          </p>
        </motion.div>

        <div className="success-content">
          {/* Booking Information Card */}
          <motion.div 
            className="success-card booking-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3>Thông tin đặt xe</h3>
            <div className="booking-info">
              <div className="booking-id">
                <span>Mã đặt xe:</span>
                <div className="id-container">
                  <span className="booking-id-text">{formatBookingId(bookingData.bookingId)}</span>
                  <button 
                    onClick={() => copyToClipboard(bookingData.bookingId)}
                    className="copy-btn"
                    title="Sao chép mã đặt xe"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div className="car-info">
                <div className="car-image">
                  <img 
                    src={bookingData.carInfo.image} 
                    alt={bookingData.carInfo.name}
                    onError={(e) => {
                      e.target.src = '/src/anhxe/Genesis GV60 Performance.jpg';
                    }}
                  />
                </div>
                <div className="car-details">
                  <h4>{bookingData.carInfo.name}</h4>
                  <p>Năm: {bookingData.carInfo.year}</p>
                  <p>Biển số: {bookingData.carInfo.licensePlate}</p>
                </div>
              </div>
              
              <div className="rental-details">
                <div className="detail-row">
                  <span className="detail-label">Nhận xe:</span>
                  <div className="detail-value">
                    <span>{formatDate(bookingData.dates.pickup)}</span>
                    <a 
                      href={`https://maps.google.com/?q=${bookingData.locations.pickup.coordinates}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="location-link"
                    >
                      📍 {bookingData.locations.pickup.address}
                    </a>
                  </div>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Trả xe:</span>
                  <div className="detail-value">
                    <span>{formatDate(bookingData.dates.dropoff)}</span>
                    <a 
                      href={`https://maps.google.com/?q=${bookingData.locations.dropoff.coordinates}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="location-link"
                    >
                      📍 {bookingData.locations.dropoff.address}
                    </a>
                  </div>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Thời lượng:</span>
                  <span className="detail-value">{bookingData.dates.days} ngày</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contract & Payment Status Card */}
          <motion.div 
            className="success-card status-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h3>Trạng thái hợp đồng & thanh toán</h3>
            <div className="contract-payment-status">
              <div className="status-row">
                <span className="status-label">Hợp đồng:</span>
                <div className="status-badges">
                  <span className="status-badge contract-signed">✅ Đã ký điện tử</span>
                  <span className="status-badge otp-verified">✅ Đã xác thực OTP</span>
                </div>
              </div>
              
              <div className="status-row">
                <span className="status-label">Thanh toán:</span>
                <div className="status-badges">
                  <span className="status-badge payment-completed" style={{ backgroundColor: getStatusColor(bookingData.status) }}>
                    {getStatusText(bookingData.status)}
                  </span>
                </div>
              </div>
              
              <div className="payment-amounts">
                <div className="amount-row">
                  <span>Đã thanh toán hôm nay:</span>
                  <span className="amount-value">{formatCurrency(bookingData.pricing.totalToday)}</span>
                </div>
                
                {bookingData.pricing.holdDeposit > 0 && (
                  <div className="amount-row">
                    <span>Cọc tạm giữ:</span>
                    <span className="amount-value">{formatCurrency(bookingData.pricing.holdDeposit)}</span>
                  </div>
                )}
                
                {bookingData.pricing.totalAtReturn > 0 && (
                  <div className="amount-row">
                    <span>Còn lại khi trả xe:</span>
                    <span className="amount-value">{formatCurrency(bookingData.pricing.totalAtReturn)}</span>
                  </div>
                )}
              </div>
              
              {bookingData.status === 'pending' && (
                <div className="pending-notice">
                  <p>
                    Khi hệ thống xác nhận giao dịch, chúng tôi sẽ nhắn SMS. 
                    Nếu quá 15 phút, vui lòng bấm <strong>Kiểm tra lại</strong>.
                  </p>
                  <button 
                    onClick={handleCheckPaymentStatus}
                    disabled={checkingPayment}
                    className="check-status-btn"
                  >
                    {checkingPayment ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Invoice & Contract Card */}
          <motion.div 
            className="success-card actions-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h3>Hóa đơn & hợp đồng</h3>
            <div className="document-actions">
              <button onClick={handleDownloadInvoice} className="action-btn download-btn">
                💾 Tải hóa đơn PDF
              </button>
              <button onClick={handlePrintInvoice} className="action-btn print-btn">
                🧾 In hóa đơn
              </button>
              <button onClick={handleViewContract} className="action-btn view-btn">
                🔍 Xem hợp đồng
              </button>
            </div>
          </motion.div>

          {/* Additional Actions Card */}
          <motion.div 
            className="success-card additional-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <h3>Hành động bổ sung</h3>
            <div className="additional-buttons">
              <button onClick={handleAddToCalendar} className="action-btn calendar-btn">
                📅 Thêm vào lịch
              </button>
              <button onClick={handleShare} className="action-btn share-btn">
                📤 Chia sẻ
              </button>
              <button onClick={() => navigate('/')} className="action-btn home-btn">
                🏠 Về trang chủ
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, FileText, ArrowLeft, QrCode, Calendar, MapPin, User, Car, CreditCard } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ContractSuccessPage.css';

const ContractSuccessPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch contract summary - Demo version
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        
        // Demo: Use mock data instead of API call
        const mockSummary = {
          user: {
            name: 'Nguyễn Văn B',
            email: 'nguyenvanb@example.com',
            phone: '0987654321',
            idNumber: '012345678901',
            address: '123 Đường ABC, Quận XYZ, TP.HCM'
          },
          car: {
            name: 'VinFast VF 3',
            image: 'https://via.placeholder.com/300x200?text=VinFast+VF3',
            licensePlate: '51A-12345',
            color: 'Trắng'
          },
          rental: {
            startDate: '20/07/2024',
            endDate: '25/07/2024',
            pickupDate: '20/07/2024',
            pickupTime: '09:00',
            pickupLocation: 'EV Station - Bình Thạnh'
          },
          pricePerDay: 1000000,
          days: 5,
          totalPrice: 5000000,
          depositAmount: 1500000, // 30% of total
          rentalCode: `RENT-${contractId}`,
          contractCode: `CT-${contractId}`,
          pdfUrl: 'https://example.com/contract.pdf' // Mock PDF URL
        };
        
        setSummary(mockSummary);
      } catch (error) {
        console.error('Error fetching summary:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [contractId, navigate]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="contract-success-page">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="contract-success-page">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-600">Không tìm thấy thông tin hợp đồng</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="contract-success-page">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="success-title">
            Thanh toán & ký hợp đồng thành công!
          </h1>
          <p className="success-subtitle">
            Chúng tôi đã gửi hóa đơn và bản hợp đồng PDF tới email của bạn.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Customer Info */}
          <div className="info-card">
            <div className="info-header">
              <User className="w-6 h-6 text-blue-500" />
              <h3 className="info-title">Thông tin khách hàng</h3>
            </div>
            <div className="info-content">
              <div className="info-row">
                <span className="info-label">Họ tên:</span>
                <span className="info-value">{summary.user.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{summary.user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Số điện thoại:</span>
                <span className="info-value">{summary.user.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">CCCD/CMND:</span>
                <span className="info-value">{summary.user.idNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Địa chỉ:</span>
                <span className="info-value">{summary.user.address}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Car & Rental Info */}
          <div className="info-card">
            <div className="info-header">
              <Car className="w-6 h-6 text-green-500" />
              <h3 className="info-title">Thông tin xe & lịch nhận xe</h3>
            </div>
            <div className="info-content">
              <div className="car-summary">
                <img 
                  src={summary.car.image} 
                  alt={summary.car.name}
                  className="car-thumbnail"
                />
                <div className="car-details">
                  <h4 className="car-name">{summary.car.name}</h4>
                  <p className="car-specs">
                    Biển số: {summary.car.licensePlate} | Màu: {summary.car.color}
                  </p>
                </div>
              </div>
              
              <div className="rental-info">
                <div className="info-row">
                  <span className="info-label">Thời gian thuê:</span>
                  <span className="info-value">
                    {summary.rental.startDate} - {summary.rental.endDate}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Ngày nhận xe:</span>
                  <span className="info-value">
                    {summary.rental.pickupDate} {summary.rental.pickupTime}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Địa điểm nhận xe:</span>
                  <span className="info-value">{summary.rental.pickupLocation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Card */}
        <div className="receipt-card">
          <div className="receipt-header">
            <CreditCard className="w-6 h-6 text-green-500" />
            <h3 className="receipt-title">Biên nhận tiền đặt cọc</h3>
          </div>
          
          <div className="receipt-content">
            <div className="receipt-info">
              <div className="receipt-row">
                <span className="receipt-label">Mã đặt xe:</span>
                <span className="receipt-value">{summary.rentalCode}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Mã hợp đồng:</span>
                <span className="receipt-value">{summary.contractCode}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Tổng tiền thuê:</span>
                <span className="receipt-value">{formatPrice(summary.totalPrice)}</span>
              </div>
              <div className="receipt-row highlight">
                <span className="receipt-label">Đặt cọc đã thanh toán (30%):</span>
                <span className="receipt-value amount">{formatPrice(summary.depositAmount)}</span>
              </div>
              {summary.totalPrice > summary.depositAmount && (
                <div className="receipt-row">
                  <span className="receipt-label">Số tiền còn lại khi nhận xe:</span>
                  <span className="receipt-value">{formatPrice(summary.totalPrice - summary.depositAmount)}</span>
                </div>
              )}
              <div className="receipt-row">
                <span className="receipt-label">Ngày giờ thanh toán:</span>
                <span className="receipt-value">{formatDate(new Date())}</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="qr-section">
              <div className="qr-code">
                <QrCode className="w-24 h-24 text-gray-400" />
                <p className="qr-text">Mã QR để check-in</p>
                <p className="qr-contract-id">{contractId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <div className="button-group">
            {summary.pdfUrl && (
              <a 
                href={summary.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-button primary"
              >
                <Download className="w-5 h-5" />
                Tải hợp đồng PDF
              </a>
            )}
            
            <Link 
              to={`/contract/${contractId}`}
              className="action-button secondary"
            >
              <FileText className="w-5 h-5" />
              Xem chi tiết hợp đồng
            </Link>
            
            <Link 
              to="/cars"
              className="action-button tertiary"
            >
              <ArrowLeft className="w-5 h-5" />
              Về trang thuê xe
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContractSuccessPage;

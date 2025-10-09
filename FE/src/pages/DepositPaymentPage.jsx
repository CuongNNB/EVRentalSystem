import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, Shield, Check, Copy } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DepositPaymentPage.css';

const DepositPaymentPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [selectedMethod, setSelectedMethod] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Payment methods data
  const paymentMethods = [
    {
      id: 'bank-transfer',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua ngân hàng trong nước',
      icon: CreditCard,
      color: '#10b981'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán nhanh chóng qua ví MoMo',
      icon: Smartphone,
      color: '#d946ef'
    },
    {
      id: 'ewallet',
      name: 'Ví điện tử khác',
      description: 'ZaloPay, ShopeePay, ViettelPay, VNPAY',
      icon: Wallet,
      color: '#3b82f6'
    }
  ];

  // Bank account info
  const bankInfo = {
    bankName: 'Ngân hàng TMCP Á Châu (ACB)',
    accountNumber: '1234567890',
    accountHolder: 'Công ty TNHH EV Car Rental',
    transferContent: `EVCR-${contractId}`
  };

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  // Fetch contract summary - Demo version
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        
        // Try to get real booking data first, fallback to mock
        let summaryData;
        
        try {
          const bookingData = localStorage.getItem('currentBooking');
          const customerData = localStorage.getItem('registeredUser') || localStorage.getItem('user');
          
          if (bookingData && customerData) {
            const booking = JSON.parse(bookingData);
            const customer = JSON.parse(customerData);
            
            // Calculate deposit as 30% of daily price
            const dailyPrice = booking.pricing?.dailyRate || 1000000;
            const depositAmount = Math.round(dailyPrice * 0.3);
            
            summaryData = {
              user: {
                name: customer.fullName || customer.name || 'Khách hàng',
                email: customer.email || 'email@example.com',
                phone: customer.phone || '0987654321',
                idNumber: customer.idNumber || '012345678901',
                address: customer.address || 'Địa chỉ không xác định'
              },
              car: {
                name: booking.car?.name || 'VinFast VF 8 Plus',
                image: booking.car?.image || '/anhxe/VinFast VF 8 Plus.jpg',
                licensePlate: '51A-12345',
                color: 'Trắng'
              },
              rental: {
                startDate: booking.rental?.pickupDate || '20/07/2024',
                endDate: booking.rental?.returnDate || '25/07/2024',
                pickupDate: booking.rental?.pickupDate || '20/07/2024',
                pickupTime: booking.rental?.pickupTime || '09:00',
                pickupLocation: booking.rental?.pickupLocation || 'EV Station - Bình Thạnh'
              },
              pricePerDay: dailyPrice,
              days: booking.rental?.days || 1,
              totalPrice: booking.pricing?.subtotal || dailyPrice,
              depositAmount: depositAmount, // 30% of daily price
              rentalCode: `RENT-${contractId}`,
              contractCode: `CT-${contractId}`,
              isPaid: false
            };
          } else {
            throw new Error('No booking data found');
          }
        } catch (error) {
          // Fallback to mock data
          summaryData = {
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
            depositAmount: 300000, // 30% of daily price
            rentalCode: `RENT-${contractId}`,
            contractCode: `CT-${contractId}`,
            isPaid: false
          };
        }
        
        const mockSummary = summaryData;
        
        setSummary(mockSummary);
        
        // If already paid, redirect to success page
        if (mockSummary.isPaid) {
          navigate(`/contract/${contractId}/success`);
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
        showToast('Không thể tải thông tin hợp đồng', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [contractId, navigate]);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Handle payment - Demo version
  const handlePayment = async () => {
    if (!selectedMethod) {
      showToast('Vui lòng chọn phương thức thanh toán', 'error');
      return;
    }

    setPaying(true);
    
    // Demo: Simulate payment processing
    setTimeout(() => {
      if (selectedMethod === 'bank-transfer') {
        setShowBankModal(true);
      } else {
        // Demo: Simulate successful payment for e-wallets
        showToast('Thanh toán thành công!', 'success');
        setTimeout(() => {
          navigate(`/contract/${contractId}/success`);
        }, 1500);
      }
      setPaying(false);
    }, 2000);
  };

  // Handle bank transfer confirmation - Demo version
  const handleBankTransferConfirm = async () => {
    showToast('Đã xác nhận chuyển khoản. Vui lòng chờ xử lý...', 'success');
    
    // Demo: Simulate processing time
    setTimeout(() => {
      navigate(`/contract/${contractId}/success`);
    }, 2000);
  };

  // Copy bank account number
  const copyAccountNumber = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    showToast('Đã sao chép số tài khoản', 'success');
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="deposit-payment-page">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="deposit-payment-page">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-600">Không tìm thấy thông tin hợp đồng</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="deposit-payment-page">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chọn phương thức thanh toán
          </h1>
          <p className="text-gray-600 text-lg">
            Chọn phương thức phù hợp và hoàn tất tiền đặt cọc để xác nhận đơn thuê.
          </p>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Ký hợp đồng</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Thanh toán</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Hoàn tất</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Payment Methods */}
          <div className="md:col-span-2">
            <div className="space-y-4 mb-6">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <div
                    key={method.id}
                    className={`payment-method-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: isSelected ? method.color : '#f3f4f6' }}
                      >
                        <Icon 
                          className="w-6 h-6" 
                          style={{ color: isSelected ? 'white' : method.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{method.name}</h3>
                        <p className="text-gray-600 text-sm">{method.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Security Info */}
            <div className="security-info">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Bảo mật thanh toán</h4>
                  <p className="text-gray-600 text-sm">
                    Thông tin thanh toán được mã hóa SSL 256-bit theo tiêu chuẩn bảo mật quốc tế. 
                    Chúng tôi KHÔNG lưu trữ thông tin thẻ của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="md:col-span-1">
            <div className="summary-card">
              <h3 className="summary-title">Thông tin đặt xe</h3>
              
              <div className="summary-content">
                <div className="car-info">
                  <img 
                    src={summary.car.image} 
                    alt={summary.car.name}
                    className="car-image"
                  />
                  <div>
                    <h4 className="car-name">{summary.car.name}</h4>
                    <p className="car-details">
                      Biển số: {summary.car.licensePlate} | Màu: {summary.car.color}
                    </p>
                    <p className="rental-code">Mã đặt xe: {summary.rentalCode}</p>
                  </div>
                </div>

                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Giá thuê xe/ngày</span>
                    <span>{formatPrice(summary.pricePerDay)}</span>
                  </div>
                  <div className="price-row">
                    <span>Số ngày thuê</span>
                    <span>{summary.days} ngày</span>
                  </div>
                  <div className="price-row">
                    <span>Tổng tiền thuê</span>
                    <span>{formatPrice(summary.totalPrice)}</span>
                  </div>
                  <div className="price-row">
                    <span>Đặt cọc (30%)</span>
                    <span>{formatPrice(summary.depositAmount)}</span>
                  </div>
                  
                  <div className="divider"></div>
                  
                  <div className="price-row total">
                    <span>Tổng thanh toán</span>
                    <span>{formatPrice(summary.depositAmount)}</span>
                  </div>
                </div>

                <div className="summary-actions">
                  <button
                    className={`payment-button ${!selectedMethod ? 'disabled' : ''}`}
                    onClick={handlePayment}
                    disabled={!selectedMethod || paying}
                  >
                    {paying ? 'Đang xử lý...' : 'Thanh toán'}
                  </button>
                  
                  {!selectedMethod && (
                    <p className="payment-hint">Chọn phương thức thanh toán</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bank Transfer Modal */}
      {showBankModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Thông tin chuyển khoản</h3>
            
            <div className="bank-info">
              <div className="bank-row">
                <span className="bank-label">Ngân hàng:</span>
                <span className="bank-value">{bankInfo.bankName}</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">Số tài khoản:</span>
                <div className="bank-value-with-copy">
                  <span>{bankInfo.accountNumber}</span>
                  <button 
                    className="copy-button"
                    onClick={copyAccountNumber}
                  >
                    <Copy className="w-4 h-4" />
                    Sao chép
                  </button>
                </div>
              </div>
              <div className="bank-row">
                <span className="bank-label">Chủ tài khoản:</span>
                <span className="bank-value">{bankInfo.accountHolder}</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">Nội dung CK:</span>
                <span className="bank-value transfer-content">{bankInfo.transferContent}</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">Số tiền:</span>
                <span className="bank-value amount">{formatPrice(summary.depositAmount)}</span>
              </div>
            </div>

            <div className="bank-warning">
              <p className="warning-text">
                Sau khi chuyển khoản, hệ thống sẽ tự động kiểm tra và xác nhận. 
                Thời gian 1–3 phút.
              </p>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-button secondary"
                onClick={() => setShowBankModal(false)}
              >
                Đóng
              </button>
              <button 
                className="modal-button primary"
                onClick={handleBankTransferConfirm}
              >
                Tôi đã chuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DepositPaymentPage;

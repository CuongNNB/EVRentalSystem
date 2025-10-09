import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCheckout } from '../contexts/CheckoutContext';
import { formatCurrency, formatDate, calculateDays } from '../utils/format';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useCheckout();
  const [currentStep, setCurrentStep] = useState(1);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Mock data - in real app, this would come from route params or API
  useEffect(() => {
    if (!state.carInfo) {
      actions.setCarInfo({
        id: 'GV60-2023',
        name: 'Genesis GV60 Performance',
        image: '/src/anhxe/Genesis GV60 Performance.jpg',
        year: 2023,
        licensePlate: '30A-12345',
        dailyPrice: 900000,
        kmLimit: 200,
        overKmFee: 2000
      });
    }
    
    if (!state.pickupDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 3);
      
      actions.setDates(
        tomorrow.toISOString(),
        dayAfter.toISOString()
      );
    }
    
    if (!state.pickupLocation) {
      actions.setLocations(
        { id: 'HCM-Q1', name: 'Quận 1, TP.HCM', address: '123 Nguyễn Huệ, Q1, TP.HCM' },
        { id: 'HCM-Q1', name: 'Quận 1, TP.HCM', address: '123 Nguyễn Huệ, Q1, TP.HCM' }
      );
    }
  }, []);

  const handleCustomerChange = (field, value) => {
    actions.updateCustomer({ [field]: value });
    actions.clearError(field);
  };

  const handleDocumentUpload = (type, file) => {
    if (file && file.size > 10 * 1024 * 1024) {
      actions.setError(type, 'File không được vượt quá 10MB');
      return;
    }
    actions.updateCustomerDocument(type, file);
    actions.clearError(type);
  };

  const handleAddonToggle = (addon) => {
    actions.toggleAddon(addon);
  };

  const handleAddonQuantityChange = (addonId, quantity) => {
    if (quantity <= 0) {
      actions.toggleAddon({ id: addonId });
    } else {
      actions.updateAddonQuantity(addonId, quantity);
    }
  };

  const handleVoucherApply = () => {
    if (state.voucher) {
      // Mock voucher validation
      if (state.voucher === 'EV10') {
        actions.setPricing({
          ...state.pricing,
          discount: 90000,
          totalToday: state.pricing.totalToday - 90000
        });
      }
    }
  };

  const handlePayment = async () => {
    if (!state.agreedToTerms) {
      actions.setError('terms', 'Vui lòng đồng ý với điều khoản');
      return;
    }

    actions.setLoading({ payment: true });
    
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock booking ID
      const bookingId = Math.floor(Math.random() * 1000000);
      navigate(`/checkout/success?bookingId=${bookingId}`);
    } catch (error) {
      actions.setError('payment', 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      actions.setLoading({ payment: false });
    }
  };

  const addons = [
    { id: 'child-seat', name: 'Ghế trẻ em', price: 50000, description: 'Ghế an toàn cho trẻ em' },
    { id: 'insurance', name: 'Bảo hiểm mở rộng', price: 120000, description: 'Bảo hiểm toàn diện' },
    { id: 'delivery', name: 'Giao xe tận nơi', price: 100000, description: 'Giao xe đến địa chỉ của bạn' },
    { id: 'different-return', name: 'Thu xe khác điểm', price: 150000, description: 'Trả xe tại điểm khác' },
    { id: 'charging-cable', name: 'Cáp sạc dự phòng', price: 30000, description: 'Cáp sạc bổ sung' }
  ];

  const days = state.pickupDate && state.dropoffDate 
    ? calculateDays(state.pickupDate, state.dropoffDate) 
    : 0;

  const totalPrice = state.carInfo ? state.carInfo.dailyPrice * days : 0;
  const addonsTotal = state.addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
  const vat = Math.round((totalPrice + addonsTotal) * 0.1);
  const grandTotal = totalPrice + addonsTotal + vat - (state.pricing?.discount || 0);

  return (
    <div className="checkout-page">
      <Header />
      
      <div className="checkout-container">
        {/* Breadcrumb & Stepper */}
        <div className="checkout-header">
          <div className="breadcrumb">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Xe</span>
            <span>/</span>
            <span>Chi tiết</span>
            <span>/</span>
            <span>Thanh toán</span>
          </div>
          
          <div className="stepper">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Thông tin</div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Thanh toán</div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Xác nhận</div>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          {/* Left Column */}
          <div className="checkout-main">
            {/* Car Information */}
            <div className="checkout-card">
              <h3>Thông tin đặt xe</h3>
              {state.carInfo && (
                <div className="car-info">
                  <div className="car-image">
                    <img src={state.carInfo.image} alt={state.carInfo.name} />
                  </div>
                  <div className="car-details">
                    <h4>{state.carInfo.name}</h4>
                    <p>Năm sản xuất: {state.carInfo.year}</p>
                    <p>Biển số: {state.carInfo.licensePlate}</p>
                    <div className="rental-dates">
                      <div className="date-info">
                        <strong>Nhận xe:</strong>
                        <span>{formatDate(state.pickupDate)}</span>
                        <span>{state.pickupLocation?.address}</span>
                      </div>
                      <div className="date-info">
                        <strong>Trả xe:</strong>
                        <span>{formatDate(state.dropoffDate)}</span>
                        <span>{state.dropoffLocation?.address}</span>
                      </div>
                      <div className="date-info">
                        <strong>Số ngày thuê:</strong>
                        <span>{days} ngày</span>
                      </div>
                    </div>
                    <div className="car-policies">
                      <p>Giới hạn: {state.carInfo.kmLimit}km/ngày</p>
                      <p>Phụ phí vượt km: {formatCurrency(state.carInfo.overKmFee)}/km</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="checkout-card">
              <h3>Thông tin người thuê</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    value={state.customer.name}
                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                  {state.errors.name && <span className="error">{state.errors.name}</span>}
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={state.customer.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    placeholder="Nhập email"
                  />
                  {state.errors.email && <span className="error">{state.errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={state.customer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                  {state.errors.phone && <span className="error">{state.errors.phone}</span>}
                </div>
                
                <div className="form-group">
                  <label>Ngày sinh *</label>
                  <input
                    type="date"
                    value={state.customer.birthDate}
                    onChange={(e) => handleCustomerChange('birthDate', e.target.value)}
                  />
                  {state.errors.birthDate && <span className="error">{state.errors.birthDate}</span>}
                </div>
              </div>

              {/* Document Upload */}
              <div className="document-upload">
                <h4>Giấy tờ tùy thân</h4>
                <div className="upload-grid">
                  <div className="upload-group">
                    <label>Mặt trước CCCD/CMND</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleDocumentUpload('cccdFront', e.target.files[0])}
                    />
                    {state.customer.documents.cccdFront && (
                      <span className="file-name">{state.customer.documents.cccdFront.name}</span>
                    )}
                  </div>
                  
                  <div className="upload-group">
                    <label>Mặt sau CCCD/CMND</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleDocumentUpload('cccdBack', e.target.files[0])}
                    />
                    {state.customer.documents.cccdBack && (
                      <span className="file-name">{state.customer.documents.cccdBack.name}</span>
                    )}
                  </div>
                  
                  <div className="upload-group">
                    <label>Bằng lái xe</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleDocumentUpload('licenseFront', e.target.files[0])}
                    />
                    {state.customer.documents.licenseFront && (
                      <span className="file-name">{state.customer.documents.licenseFront.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div className="checkout-card">
              <h3>Tùy chọn bổ sung</h3>
              <div className="addons-list">
                {addons.map(addon => {
                  const isSelected = state.addons.find(item => item.id === addon.id);
                  return (
                    <div key={addon.id} className="addon-item">
                      <div className="addon-info">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => handleAddonToggle(addon)}
                        />
                        <div>
                          <h4>{addon.name}</h4>
                          <p>{addon.description}</p>
                          <span className="addon-price">{formatCurrency(addon.price)}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="addon-quantity">
                          <button onClick={() => handleAddonQuantityChange(addon.id, isSelected.quantity - 1)}>-</button>
                          <span>{isSelected.quantity}</span>
                          <button onClick={() => handleAddonQuantityChange(addon.id, isSelected.quantity + 1)}>+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-card">
              <h3>Phương thức thanh toán</h3>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={state.paymentMethod === 'vnpay'}
                    onChange={(e) => actions.setPaymentMethod(e.target.value)}
                  />
                  <span>VNPay</span>
                </label>
                
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={state.paymentMethod === 'momo'}
                    onChange={(e) => actions.setPaymentMethod(e.target.value)}
                  />
                  <span>MoMo</span>
                </label>
                
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={state.paymentMethod === 'bank'}
                    onChange={(e) => actions.setPaymentMethod(e.target.value)}
                  />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
              </div>
            </div>

            {/* Voucher */}
            <div className="checkout-card">
              <h3>Mã khuyến mãi</h3>
              <div className="voucher-input">
                <input
                  type="text"
                  value={state.voucher}
                  onChange={(e) => actions.setVoucher(e.target.value)}
                  placeholder="Nhập mã khuyến mãi"
                />
                <button onClick={handleVoucherApply}>Áp dụng</button>
              </div>
            </div>

            {/* Terms */}
            <div className="checkout-card">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={state.agreedToTerms}
                  onChange={(e) => actions.setTermsAgreement(e.target.checked)}
                />
                <span>
                  Tôi đồng ý với{' '}
                  <button type="button" onClick={() => setShowTermsModal(true)}>
                    Điều khoản thuê xe
                  </button>
                  ,{' '}
                  <button type="button" onClick={() => setShowTermsModal(true)}>
                    Chính sách hủy
                  </button>
                  {' '}và{' '}
                  <button type="button" onClick={() => setShowTermsModal(true)}>
                    Xử lý dữ liệu cá nhân
                  </button>
                </span>
              </label>
              {state.errors.terms && <span className="error">{state.errors.terms}</span>}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>Tóm tắt đơn hàng</h3>
              
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Giá thuê ({days} ngày)</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                
                {state.addons.map(addon => (
                  <div key={addon.id} className="price-row">
                    <span>{addon.name} x{addon.quantity}</span>
                    <span>{formatCurrency(addon.price * addon.quantity)}</span>
                  </div>
                ))}
                
                <div className="price-row">
                  <span>VAT (10%)</span>
                  <span>{formatCurrency(vat)}</span>
                </div>
                
                {state.pricing?.discount > 0 && (
                  <div className="price-row discount">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(state.pricing.discount)}</span>
                  </div>
                )}
                
                <div className="price-row total">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              
              <div className="security-info">
                <p>🔒 Thanh toán an toàn qua VNPay – 3D Secure/OTP</p>
              </div>
              
              <button
                className="payment-button"
                onClick={handlePayment}
                disabled={state.loading.payment || !state.agreedToTerms}
              >
                {state.loading.payment ? 'Đang xử lý...' : 'Hoàn tất thanh toán'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;

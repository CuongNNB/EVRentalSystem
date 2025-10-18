import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CustomerInfoPage.css';

const CustomerInfoPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [customerData, setCustomerData] = useState(null);
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lấy dữ liệu từ localStorage hoặc API
        const savedCustomer = localStorage.getItem('registeredUser');
        const savedUser = localStorage.getItem('user'); // Lấy từ login
        const savedBooking = localStorage.getItem('currentBooking');
        const contractData = location.state?.contractData;

        console.log('CustomerInfoPage - savedCustomer:', savedCustomer);
        console.log('CustomerInfoPage - savedUser:', savedUser);
//  console.log('CustomerInfoPage - savedBooking:', savedBooking);
        // Ưu tiên lấy từ registeredUser, nếu không có thì lấy từ user (login)
        if (savedCustomer) {
            try {
                const customerData = JSON.parse(savedCustomer);
                console.log('CustomerInfoPage - Parsed customerData:', customerData);
                setCustomerData(customerData);
            } catch (error) {
                console.error('Error parsing savedCustomer:', error);
            }
        } else if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                console.log('CustomerInfoPage - Parsed userData:', userData);
                setCustomerData({
                    name: userData.name,
                    fullName: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    address: userData.address,
                    birthDate: userData.birthDate || "01/01/1990",
                    idCardFront: userData.idCardFront || "cccd_front.jpg",
                    idCardBack: userData.idCardBack || "cccd_back.jpg",
                    driverLicense: userData.driverLicense || "license.jpg"
                });
            } catch (error) {
                console.error('Error parsing savedUser:', error);
            }
        }

        if (savedBooking) {
            setBookingData(JSON.parse(savedBooking));
        } else {
            // Mock data nếu không có dữ liệu
            setBookingData({
                car: {
                    name: "Genesis GV60 Performance",
                    year: "2023",
                    plateNumber: "30A-12345",
                    image: "/anhxe/Genesis GV60 Performance.jpg"
                },
                rental: {
                    pickupLocation: "123 Nguyễn Huệ, Q1, TP.HCM",
                    pickupDate: "10 tháng 10, 2025",
                    pickupTime: "21:46",
                    returnLocation: "123 Nguyễn Huệ, Q1, TP.HCM",
                    returnDate: "12 tháng 10, 2025",
                    returnTime: "21:46",
                    days: 2
                },
                pricing: {
                    dailyRate: 900000,
                    days: 2,
                    subtotal: 1800000,
                    vat: 180000,
                    total: 1980000,
                    km_limit: "200km/ngày",
                    overage_fee: "2.000 đ/km"
                }
            });
        }

        setLoading(false);
    }, [location]);

    const handleCompleteBooking = () => {
        // Chuyển đến trang thanh toán/checkout
        // Lưu thông tin cần thiết để trang thanh toán sử dụng (tuỳ chỉnh theo flow của bạn)
        localStorage.setItem('checkout_customer', JSON.stringify(customerData || {}));
        localStorage.setItem('checkout_booking', JSON.stringify(bookingData || {}));
        navigate('/checkout');
    };

    const handleEditInfo = () => {
        // Chuyển về trang chỉnh sửa thông tin
        navigate('/booking/edit', {
            state: { customerData, bookingData }
        });
    };

    if (loading) {
        return (
            <div className="customer-info-page">
                <Header />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
                <Footer />
            </div>
        );
    }

    // Debug info
    console.log('CustomerInfoPage - Final customerData:', customerData);
    console.log('CustomerInfoPage - Final bookingData:', bookingData);

    return (
        <div className="customer-info-page">
            <Header />

            <div className="customer-info-container">
                {/* Progress Steps */}
                <div className="progress-steps">
                    <div className="step completed">
                        <div className="step-number">1</div>
                        <span>Thông tin</span>
                    </div>
                    <div className="step completed">
                        <div className="step-number">2</div>
                        <span>Thanh toán</span>
                    </div>
                    <div className="step active">
                        <div className="step-number">3</div>
                        <span>Xác nhận</span>
                    </div>
                </div>

                <div className="content-grid">
                    {/* Left Column - Booking Details */}
                    <div className="booking-details-section">
                        {/* Car Information */}
                        <div className="info-card">
                            <h3>Thông tin đặt xe</h3>

                            <div className="car-info">
                                <div className="car-image">
                                    <img src={bookingData?.car?.image} alt={bookingData?.car?.name} />
                                </div>
                                <div className="car-details">
                                    <h4>{bookingData?.car?.name}</h4>
                                    <p>Năm sản xuất: {bookingData?.car?.year}</p>
                                    <p>Biển số: {bookingData?.car?.plateNumber}</p>
                                </div>
                            </div>

                            {/* Rental Details */}
                            <div className="rental-details">
                                <div className="detail-row">
                                    <div className="detail-item">
                                        <h5>Nhận xe:</h5>
                                        <p>lúc: {bookingData?.rental?.pickupTime} {bookingData?.rental?.pickupDate}</p>
                                        <p>{bookingData?.rental?.pickupLocation}</p>
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <div className="detail-item">
                                        <h5>Trả xe:</h5>
                                        <p>lúc: {bookingData?.rental?.returnTime} {bookingData?.rental?.returnDate}</p>
                                        <p>{bookingData?.rental?.returnLocation}</p>
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <div className="detail-item">
                                        <h5>Số ngày thuê:</h5>
                                        <p>{bookingData?.rental?.days} ngày</p>
                                    </div>
                                </div>

                                <div className="usage-limits">
                                    <p><strong>Giới hạn:</strong> {bookingData?.pricing?.km_limit}</p>
                                    <p><strong>Phụ phí vượt km:</strong> {bookingData?.pricing?.overage_fee}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="info-card">
                            <div className="card-header">
                                <h3>Thông tin người thuê</h3>
                                <button className="edit-btn" onClick={handleEditInfo}>
                                    ✏️ Chỉnh sửa
                                </button>
                            </div>

                            {customerData && (customerData.fullName || customerData.name) && (
                                <div className="auto-fill-notice">
                                    <div className="notice-icon">🎉</div>
                                    <div className="notice-text">
                                        <strong>Thông tin đã được điền tự động!</strong>
                                        <p>Dữ liệu từ tài khoản của bạn đã được tự động điền vào các trường bên dưới.</p>
                                    </div>
                                </div>
                            )}

                            <div className="customer-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Họ và tên *</label>
                                        <input
                                            type="text"
                                            value={customerData?.fullName || customerData?.name || "Chưa có thông tin"}
                                            readOnly
                                            className={customerData?.fullName || customerData?.name ? "filled" : "empty"}
                                        />
                                        {customerData && (customerData.fullName || customerData.name) && (
                                            <div className="field-status">✅ Đã điền tự động</div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={customerData?.email || "Chưa có thông tin"}
                                            readOnly
                                            className={customerData?.email ? "filled" : "empty"}
                                        />
                                        {customerData?.email && (
                                            <div className="field-status">✅ Đã điền tự động</div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Số điện thoại *</label>
                                        <input
                                            type="tel"
                                            value={customerData?.phone || "Chưa có thông tin"}
                                            readOnly
                                            className={customerData?.phone ? "filled" : "empty"}
                                        />
                                        {customerData?.phone && (
                                            <div className="field-status">✅ Đã điền tự động</div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày sinh *</label>
                                        <input
                                            type="text"
                                            value={customerData?.birthDate || "Chưa có thông tin"}
                                            readOnly
                                            className={customerData?.birthDate ? "filled" : "empty"}
                                        />
                                        {customerData?.birthDate && (
                                            <div className="field-status">✅ Đã điền tự động</div>
                                        )}
                                    </div>
                                </div>

                                <div className="documents-section">
                                    <h4>Giấy tờ tùy thân</h4>
                                    <div className="document-row">
                                        <div className="document-item">
                                            <label>Mặt trước CCCD/CMND</label>
                                            <div className="file-display">
                                                📄 {customerData?.idCardFront || "cccd_front.jpg"}
                                            </div>
                                        </div>
                                        <div className="document-item">
                                            <label>Mặt sau CCCD/CMND</label>
                                            <div className="file-display">
                                                📄 {customerData?.idCardBack || "cccd_back.jpg"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="document-row">
                                        <div className="document-item">
                                            <label>Bằng lái xe</label>
                                            <div className="file-display">
                                                📄 {customerData?.driverLicense || "license.jpg"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="order-summary-section">
                        <div className="summary-card">
                            <h3>Tóm tắt đơn hàng</h3>

                            <div className="price-breakdown">
                                <div className="price-row">
                                    <span>Giá thuê ({bookingData?.rental?.days} ngày)</span>
                                    <span>{bookingData?.pricing?.subtotal?.toLocaleString()} ₫</span>
                                </div>
                                <div className="price-row">
                                    <span>VAT (10%)</span>
                                    <span>{bookingData?.pricing?.vat?.toLocaleString()} ₫</span>
                                </div>
                                <div className="price-row total">
                                    <span><strong>Tổng thanh toán</strong></span>
                                    <span><strong>{bookingData?.pricing?.total?.toLocaleString()} ₫</strong></span>
                                </div>
                            </div>

                            <div className="payment-notice">
                                <div className="notice-icon">⚠️</div>
                                <p>Thanh toán an toàn qua VNPay - 3D Secure/OTP</p>
                            </div>

                            <button className="complete-booking-btn" onClick={handleCompleteBooking}>
                                Hoàn tất thanh toán
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="additional-info">
                            <div className="info-item">
                                <div className="info-icon">🚗</div>
                                <div>
                                    <h4>Xe sạch & an toàn</h4>
                                    <p>Được vệ sinh và khử trùng sau mỗi chuyến đi</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">🛡️</div>
                                <div>
                                    <h4>Bảo hiểm toàn diện</h4>
                                    <p>Bảo hiểm vật chất và trách nhiệm dân sự</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">📞</div>
                                <div>
                                    <h4>Hỗ trợ 24/7</h4>
                                    <p>Đội ngũ hỗ trợ sẵn sàng giúp đỡ bạn</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CustomerInfoPage;
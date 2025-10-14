import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, Shield, Check, Copy, Calendar, MapPin, Clock, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DepositPaymentPage.css';

const DepositPaymentPage = () => {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { contractSummary } = location.state || {};

    const [selectedMethod, setSelectedMethod] = useState('');
    const [summary, setSummary] = useState(null);
    const [paying, setPaying] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showConfirmOverlay, setShowConfirmOverlay] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // ✅ Các phương thức thanh toán
    const paymentMethods = [
        {
            id: 'bank-transfer',
            name: 'Chuyển khoản ngân hàng',
            description: 'Chuyển khoản qua ngân hàng trong nước',
            icon: CreditCard,
            color: '#10b981',
            qr: '/qrimage/bank_qr.png'
        },
        {
            id: 'momo',
            name: 'Ví MoMo',
            description: 'Thanh toán nhanh chóng qua ví MoMo',
            icon: Smartphone,
            color: '#d946ef',
            qr: '/qrimage/momo_qr.png'
        },
        {
            id: 'ewallet',
            name: 'Ví điện tử khác',
            description: 'ZaloPay, ShopeePay, ViettelPay, VNPAY',
            icon: Wallet,
            color: '#3b82f6',
            qr: '/qrimage/ewallet_qr.png'
        }
    ];

    // ✅ Dùng dữ liệu forward
    useEffect(() => {
        if (!contractSummary) return;

        const { contractData, bookingData } = contractSummary;

        const summaryData = {
            user: {
                name: contractData?.renter?.name,
                email: contractData?.renter?.email,
                phone: contractData?.renter?.phone,
                address: contractData?.renter?.address || 'Không rõ',
            },
            car: {
                name: contractData?.car?.name,
                licensePlate: contractData?.car?.licensePlate,
                color: contractData?.car?.color,
            },
            rental: contractData?.rental || bookingData?.bookingForm || {},
            pricePerDay: contractData?.car?.price,
            days: contractData?.car?.rentalDays,
            totalPrice: contractData?.car?.totalAmount,
            depositAmount: contractData?.car?.deposit,
            contractCode: contractData?.contractId,
            // giữ nguyên raw để tìm bookingId nếu cần
            _raw: { contractData, bookingData }
        };

        setSummary(summaryData);
    }, [contractSummary]);

    // ✅ Toast
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    // ✅ Định dạng tiền
    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    // ✅ Xử lý thanh toán (mở modal QR)
    const handlePayment = async () => {
        if (!selectedMethod) {
            showToast('Vui lòng chọn phương thức thanh toán', 'error');
            return;
        }
        setShowQRModal(true); // ✅ Hiển thị modal QR
    };

    // Hỗ trợ tìm bookingId trong contractSummary (nhiều chỗ khả dĩ)
    const extractBookingId = () => {
        if (!contractSummary) return null;
        const { contractData, bookingData } = contractSummary;

        // thử nhiều chỗ khả dĩ
        const candidates = [
            bookingData?.bookingPayload?.bookingId,
            bookingData?.bookingPayload?.id,
            bookingData?.bookingId,
            bookingData?.response?.bookingId,
            bookingData?.response?.id,
            contractData?.contractId, // fallback nếu backend dùng contractId tương ứng
            contractData?.bookingId,
            contractData?.renter?.bookingId
        ];

        for (const c of candidates) {
            if (c !== undefined && c !== null && c !== '') return c;
        }
        return null;
    };

    // ✅ Khi user nhấn “Tôi đã thanh toán”
    const handleBankTransferConfirm = async () => {
        // đóng modal QR
        setShowQRModal(false);

        // tìm bookingId
        const bookingId = extractBookingId();

        // nếu ko tìm thấy bookingId -> notify and show overlay but don't call api
        if (!bookingId) {
            showToast('Không tìm thấy bookingId để xác nhận đặt cọc. Vui lòng thử lại hoặc liên hệ hỗ trợ.', 'error');
            // vẫn show overlay thông báo (không gọi API)
            setShowConfirmOverlay(true);
            // sau 3s quay về home (giữ hành vi cũ)
            setTimeout(() => {
                navigate('/');
            }, 3000);
            return;
        }

        // Gọi API confirm deposit
        setPaying(true);
        try {
            const payload = { bookingId }; // gửi theo yêu cầu: truyền về bookingId
            const resp = await fetch('http://localhost:8084/EVRentalSystem/api/bookings/confirm-deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // nếu cần auth token, thêm: 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const text = await resp.text().catch(() => null);
                throw new Error(text || `HTTP ${resp.status}`);
            }

            const respText = await resp.text().catch(() => 'Xác nhận thành công');

            // Hiện overlay xác nhận và toast thành công
            showToast('Xác nhận đặt cọc thành công', 'success');
            setShowConfirmOverlay(true);

            // Sau 2.5s quay về trang chủ (như hành vi cũ)
            setTimeout(() => {
                navigate('/');
            }, 2500);
        } catch (error) {
            console.error('Lỗi khi gọi confirm-deposit:', error);
            showToast('Xác nhận đặt cọc thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.', 'error');
            // hiển thị overlay lỗi để user biết
            setShowConfirmOverlay(true);

            // bạn có thể giữ user lại trang này hoặc chuyển về home sau 3s — mình giữ 3s như cũ
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } finally {
            setPaying(false);
        }
    };

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Chọn phương thức thanh toán
                    </h1>
                    <p className="text-gray-600 text-lg text-center">
                        Chọn phương thức phù hợp và hoàn tất tiền đặt cọc để xác nhận đơn thuê.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* Cột trái: Phương thức thanh toán */}
                    <div>
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
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                                                <Icon className="w-6 h-6" style={{ color: method.color }} />
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

                    {/* Cột phải: Thông tin booking */}
                    <div>
                        <div className="summary-card">
                            <h3 className="summary-title">Thông tin đặt xe</h3>
                            <div className="summary-content">
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-gray-800">
                                        <Calendar className="w-5 h-5 mr-3 text-emerald-600" />
                                        <span><strong>Ngày nhận xe:</strong> {summary.rental?.startDate || summary.rental?.pickupDateTime}</span>
                                    </div>
                                    <div className="flex items-center text-gray-800">
                                        <Clock className="w-5 h-5 mr-3 text-blue-600" />
                                        <span><strong>Ngày trả xe:</strong> {summary.rental?.endDate || summary.rental?.returnDateTime}</span>
                                    </div>
                                    <div className="flex items-center text-gray-800">
                                        <MapPin className="w-5 h-5 mr-3 text-red-500" />
                                        <span><strong>Địa điểm nhận xe:</strong> {summary.rental?.pickupLocation || 'Không rõ'}</span>
                                    </div>
                                </div>

                                <div className="price-breakdown">
                                    <div className="price-row"><span>Giá thuê/ngày</span><span>{formatPrice(summary.pricePerDay)}</span></div>
                                    <div className="price-row"><span>Số ngày thuê</span><span>{summary.days} ngày</span></div>
                                    <div className="price-row"><span>Đặt cọc (30%)</span><span>{formatPrice(summary.depositAmount)}</span></div>
                                    <div className="divider"></div>
                                    <div className="price-row total"><span>Tổng thanh toán</span><span>{formatPrice(summary.depositAmount)}</span></div>
                                </div>

                                <div className="summary-actions">
                                    <button
                                        className={`payment-button ${!selectedMethod ? 'disabled' : ''}`}
                                        onClick={handlePayment}
                                        disabled={!selectedMethod || paying}
                                    >
                                        {paying ? 'Đang xử lý...' : 'Thanh toán'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* === QR Modal === */}
            {showQRModal && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal">
                        {/* ✅ Nút Close */}
                        <button className="close-btn" onClick={() => setShowQRModal(false)}>
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="qr-modal-title">Quét mã QR để thanh toán</h2>
                        <p className="qr-modal-desc">Sử dụng ứng dụng {selectedMethod === 'momo' ? 'MoMo' : 'ngân hàng'} để quét mã.</p>

                        <img
                            src={paymentMethods.find(m => m.id === selectedMethod)?.qr}
                            alt="QR Code"
                            className="qr-image"
                        />

                        <button
                            className="modal-button primary"
                            onClick={handleBankTransferConfirm}
                            disabled={paying}
                        >
                            {paying ? 'Đang xác nhận...' : 'Tôi đã thanh toán'}
                        </button>
                    </div>
                </div>
            )}

            {/* === Overlay xác nhận ss=== */}
            {showConfirmOverlay && (
                <div className="confirm-overlay">
                    <div className="confirm-message-box">
                        <h2>Chúng tôi sẽ sớm xác nhận đơn hàng của quý khách</h2>
                        <p>Bạn có thể liên hệ qua hotline để xác nhận ngay!</p>
                    </div>
                </div>
            )}

            {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            <Footer />
        </div>
    );
};

export default DepositPaymentPage;

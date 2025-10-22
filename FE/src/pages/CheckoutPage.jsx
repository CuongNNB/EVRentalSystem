// CheckOutPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, Shield, Check, Calendar, MapPin, Clock, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CheckoutPage.css'; // CSS mới của bạn

// NOTE: This component now supports two optional props:
// - forwardedFromParent: object passed when embedded (if provided, it takes precedence over location.state)
// - embedded: boolean; if true, Header/Footer are not rendered (useful when rendering inside a modal)
const CheckOutPage = ({ forwardedFromParent = null, embedded = false }) => {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // The booking detail is forwarded from BookingDetailHistory as location.state.detailBookingSummary
    // But if parent passed forwardedFromParent, prefer that.
    const forwarded = location?.state?.detailBookingSummary ?? null;
    const forwardedToUse = forwardedFromParent ?? forwarded ?? null;

    const [selectedMethod, setSelectedMethod] = useState('');
    const [summary, setSummary] = useState(null);
    const [paying, setPaying] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Coupon / discount (mock only, percent-based)
    const [couponCode, setCouponCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [couponApplied, setCouponApplied] = useState(null);

    const [promotions, setPromotions] = useState([]); // danh sách promotion
    const [promotionsLoading, setPromotionsLoading] = useState(false);

    const paymentMethods = [
        { id: 'bank-transfer', name: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản qua ngân hàng trong nước', icon: CreditCard, color: '#10b981', qr: '/qrimage/bank_qr.png' },
        { id: 'momo', name: 'Ví MoMo', description: 'Thanh toán nhanh chóng qua ví MoMo', icon: Smartphone, color: '#d946ef', qr: '/qrimage/momo_qr.png' },
        { id: 'ewallet', name: 'Ví điện tử khác', description: 'ZaloPay, ShopeePay, ViettelPay, VNPAY', icon: Wallet, color: '#3b82f6', qr: '/qrimage/ewallet_qr.png' }
    ];

    useEffect(() => {
        // Build summary from forwarded data if present; otherwise use fallback mock (so UI always shows something)
        // --- Khi nhận forwarded detailBookingSummary, chuẩn hoá kĩ:
        if (forwardedToUse) {
            const totals = forwardedToUse.totals || {};

            // Nếu có totalRental thì lấy trực tiếp, nếu không thì tính lại như cũ
            const totalRental = Number(totals.totalRental ?? 0);

            // Giá thuê/ngày fallback
            const rawDaily = (typeof totals.dailyPrice !== 'undefined'
                ? totals.dailyPrice
                : (typeof totals.pricePerDay !== 'undefined'
                    ? totals.pricePerDay
                    : (typeof totals.pricePerHour !== 'undefined' ? totals.pricePerHour * 24 : 0)));

            const mapped = {
                user: {
                    name: forwardedToUse.user?.name ?? '',
                    email: forwardedToUse.user?.email ?? '',
                    phone: forwardedToUse.user?.phone ?? '',
                    address: forwardedToUse.user?.address ?? ''
                },
                car: {
                    name: forwardedToUse.carData?.name ?? '',
                    licensePlate: forwardedToUse.carData?.licensePlate ?? ''
                },
                rental: {
                    pickupLocation: forwardedToUse.bookingPayload?.pickupLocation ?? '',
                    startDate: forwardedToUse.bookingPayload?.startTime ?? '',
                    endDate: forwardedToUse.bookingPayload?.actualReturnTime ?? ''
                },
                pricePerDay: forwardedToUse.pricePerDay || 0,
                depositAmount: Number(totals.deposit ?? 0),
                totalRental: totalRental, // ✅ Thêm dòng này để lưu “Tiền dự tính phải trả”
                contractCode: forwardedToUse.bookingId ?? contractId ?? null,
                extraFees: Array.isArray(forwardedToUse.extraFees)
                    ? forwardedToUse.extraFees.map(f => {
                        const feeType = f.feeType || f.label || f.name || f.feeName;
                        const feeLabelMap = {
                            Damage_Fee: 'Phí hư hỏng xe',
                            Over_Mileage_Fee: 'Phí vượt quá odo quy định',
                            Late_Return_Fee: 'Phí trả trễ xe',
                            Cleaning_Fee: 'Phí vệ sinh xe',
                            Fuel_Fee: 'Phí xăng dầu',
                            Other_Fee: 'Phí khác'
                        };
                        const label = feeLabelMap[feeType] || f.label || f.name || f.feeName || 'Phí phát sinh khác';
                        const amount = Number(f.amount ?? f.feeAmount ?? 0) || 0;
                        return { id: f.id ?? feeType ?? 'extra', label, amount };
                    })
                    : []
            };
            setSummary(mapped);
            return;
        }

        // fallback mock
        const fallback = {
            user: { name: 'Nguyễn Văn A', email: 'a.nguyen@example.com', phone: '0987654321', address: 'Hà Nội' },
            car: { name: 'Toyota Vios 2020', licensePlate: '30A-123.45' },
            rental: { pickupLocation: 'Trạm 1 - Hà Nội', startDate: '2025-10-28T09:00:00', endDate: '2025-10-30T11:00:00' },
            pricePerDay: 450000,
            depositAmount: 300000,
            contractCode: contractId || 'CT-20251020-001',
            extraFees: [
                { id: 'clean', label: 'Phí dọn xe', amount: 50000 },
                { id: 'late', label: 'Phí trả muộn', amount: 30000 }
            ]
        };
        setSummary(fallback);
    }, [forwardedToUse, contractId]);

    // Fetch danh sách promotions hợp lệ từ backend
    useEffect(() => {
        const fetchPromotions = async () => {
            setPromotionsLoading(true);
            try {
                const resp = await fetch('http://localhost:8084/EVRentalSystem/api/promotions/valid', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!resp.ok) throw new Error(`Server trả về ${resp.status}`);
                const data = await resp.json();
                // Giả định data là array of PromotionResponse
                setPromotions(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Lỗi fetch promotions:', err);
                showToast('Không thể lấy danh sách mã giảm giá từ server', 'error');
                setPromotions([]);
            } finally {
                setPromotionsLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500);
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    // --- computeDaysHours: trả về totalHours, days, hours, formatted ---
    const computeDaysHours = (start, end) => {
        try {
            const s = new Date(start);
            const e = new Date(end);
            if (isNaN(s) || isNaN(e)) return { totalHours: 0, days: 0, hours: 0, formatted: '0 giờ' };

            const ms = e.getTime() - s.getTime();
            const totalHoursRaw = ms / (1000 * 60 * 60);
            const totalHours = Math.ceil(totalHoursRaw);

            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;

            let formatted = '';
            if (days > 0) {
                formatted = `${days} ngày${hours > 0 ? ' ' + hours + ' giờ' : ''}`;
            } else {
                formatted = `${hours} giờ`;
            }

            return { totalHours, days, hours, formatted };
        } catch {
            return { totalHours: 0, days: 0, hours: 0, formatted: '0 giờ' };
        }
    };

    // Format thời gian dạng DD/MM/YYYY, HH:mm
    const formatDateTime = (datetime) => {
        if (!datetime) return '—';
        const date = new Date(datetime);
        if (isNaN(date)) return '—';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year}, ${hours}:${minutes}`;
    };


    const extraFeesSum = (summary?.extraFees || []).reduce((s, f) => s + (Number(f.amount ?? 0) || 0), 0);
    const depositAmount = Number(summary?.depositAmount ?? 0);

    // lấy ngày + giờ + tổng giờ
    const { totalHours: rentalHours, formatted: rentalDurationText } =
        computeDaysHours(summary?.rental?.startDate, summary?.rental?.endDate);
    const pricePerDay = Number(depositAmount / 0.3);
    const pricePerHour = pricePerDay / 24;
    const rentalTotal = Math.round(depositAmount / 0.3); //tổng giá thuê
    const discountAmount = Math.round((discountPercent / 100) * rentalTotal);

    // Tổng thanh toán theo công thức bạn yêu cầu:
    // Tổng thanh toán = (Tổng giá thuê) + (Các phí phát sinh) - (tiền cọc) - (tiền giảm giá trên tổng giá thuê)
    const finalTotal = Math.round(Math.max(0, rentalTotal + extraFeesSum - depositAmount - discountAmount));

    const handleApplyCoupon = () => {
        const codeInput = (couponCode || '').trim().toUpperCase();
        if (!codeInput) {
            setDiscountPercent(0);
            setCouponApplied(null);
            showToast('Vui lòng nhập mã giảm giá', 'error');
            return;
        }

        // Nếu đã áp dụng 1 mã, thì nút sẽ làm chức năng 'hủy bỏ' (xem phần UI)
        if (couponApplied) {
            // HỦY MÃ
            setDiscountPercent(0);
            setCouponApplied(null);
            setCouponCode(''); // tùy chọn: xoá input sau hủy
            showToast('Đã hủy mã giảm giá', 'info');
            return;
        }

        // Tìm promotion khớp promoName (thử check promoName và cũng lùi -> promo.code nếu cần)
        const found = promotions.find(p =>
            (p.promoName && p.promoName.toString().toUpperCase() === codeInput) ||
            (p.code && p.code.toString().toUpperCase() === codeInput)
        );

        if (!found) {
            setDiscountPercent(0);
            setCouponApplied(null);
            showToast('Mã không tồn tại hoặc không hợp lệ', 'error');
            return;
        }

        // kiểm tra trạng thái và thời gian: status === 'ACTIVE' và đang trong range startTime..endTime
        try {
            const now = new Date();
            const start = found.startTime ? new Date(found.startTime) : null;
            const end = found.endTime ? new Date(found.endTime) : null;
            const statusOk = (found.status && found.status.toUpperCase() === 'ACTIVE');
            const timeOk = (!start || now >= start) && (!end || now <= end);

            if (!statusOk) {
                showToast('Mã hiện không hoạt động', 'error');
                return;
            }
            if (!timeOk) {
                showToast('Mã đã hết hiệu lực hoặc chưa đến ngày áp dụng', 'error');
                return;
            }

            // Áp dụng
            const pct = Number(found.discountPercent || 0);
            if (!pct || isNaN(pct)) {
                showToast('Mã không có giá trị giảm hợp lệ', 'error');
                return;
            }

            setDiscountPercent(pct);
            setCouponApplied(found); // lưu toàn bộ đối tượng promotion
            showToast(`Áp dụng mã ${found.promoName}: ${pct}% giảm`, 'success');
        } catch (err) {
            console.error(err);
            showToast('Lỗi khi kiểm tra mã giảm giá', 'error');
        }
    };

    const handlePayment = () => {
        if (!selectedMethod) {
            showToast('Vui lòng chọn phương thức thanh toán', 'error');
            return;
        }
        setShowQRModal(true);
    };

    // If there's no summary (shouldn't happen, but safe guard)
    if (!summary) {
        return (
            <>
                {!embedded && <Header />}
                <div className="deposit-payment-page">
                    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: 20, color: '#6b7280' }}>Không tìm thấy thông tin</h1>
                    </main>
                </div>
                {!embedded && <Footer />}
            </>
        );
    }

    return (
        <div className="deposit-payment-page">
            {/* Khi embedded=true thì Header/Footer không hiện */}
            {!embedded && <Header />}
            <div className="dp-container">
                <div className="dp-header">
                    <h1>Thanh toán đơn hàng</h1>
                </div>

                {/* LEFT: Payment methods */}
                <div className="payment-col">
                    <div className="payment-panel">
                        <div className="panel-title">Các phương thức thanh toán</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
                            {paymentMethods.map((method) => {
                                const Icon = method.icon;
                                const isSelected = selectedMethod === method.id;
                                return (
                                    <div
                                        key={method.id}
                                        className={`payment-method-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setSelectedMethod(method.id)}
                                    >
                                        <div className="pm-icon" style={{ backgroundColor: '#f3f6f9' }}>
                                            <Icon style={{ color: method.color }} />
                                        </div>

                                        <div className="pm-body">
                                            <h3 style={{ margin: 0 }}>{method.name}</h3>
                                            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>{method.description}</p>
                                        </div>

                                        <div className="pm-right">
                                            {isSelected ? <div style={{ width: 24, height: 24, borderRadius: 12, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Check /></div> : '›'}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="secure-note">
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ color: '#10b981' }}><Shield /></div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Bảo mật thanh toán</div>
                                    <div style={{ color: '#55627a', fontSize: 13 }}>
                                        Thông tin thanh toán được mã hóa SSL 256-bit theo tiêu chuẩn bảo mật quốc tế.
                                        Chúng tôi KHÔNG lưu trữ thông tin thẻ của bạn.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="checkout-btn"
                            onClick={handlePayment}
                            disabled={!selectedMethod || paying}
                        >
                            {paying ? 'Đang xử lý...' : 'Hoàn tất thanh toán'}
                        </button>
                    </div>
                </div>

                {/* RIGHT: Order summary */}
                <div className="summary-col">
                    <div className="order-summary">
                        <div className="summary-header">
                            <h3>Thông tin đặt xe</h3>
                        </div>

                        <div className="summary-body">
                            <div className="summary-row">
                                <div className="label"><Calendar style={{ marginRight: 8 }} />Ngày nhận xe</div>
                                <div className="value">{formatDateTime(summary.rental.startDate)}</div>
                            </div>

                            <div className="summary-row">
                                <div className="label"><Clock style={{ marginRight: 8 }} />Ngày trả xe</div>
                                <div className="value">{formatDateTime(summary.rental.endDate)}</div>
                            </div>
                            <div className="summary-row">
                                <div className="label"><MapPin style={{ marginRight: 8 }} />Địa điểm nhận xe</div>
                                <div className="value" style={{ fontSize: 12 }} >{summary.rental.pickupLocation || '—'}</div>
                            </div>
                            <div className="summary-row">
                                <div className="label">Thời gian thuê</div>
                                <div className="value">{rentalDurationText}</div>
                            </div>

                            <div className="summary-row">
                                <div className="label">Tổng giá thuê</div>
                                <div className="value">
                                    {formatPrice(Math.round(rentalTotal))}
                                </div>
                            </div>

                            <div style={{ paddingTop: 6, paddingBottom: 6 }}>
                                <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 6, fontWeight: 700 }}>Các chi phí phát sinh</div>
                                {(summary.extraFees || []).map(f => (
                                    <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f0f3f6' }}>
                                        <div style={{ color: '#64748b', fontSize: 14 }}>{f.label}</div>
                                        <div style={{ fontWeight: 700 }}>{formatPrice(Number(f.amount ?? 0))}</div>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontWeight: 700 }}>
                                    <div style={{ color: '#374151' }}>Tổng chi phí phát sinh</div>
                                    <div>{formatPrice(extraFeesSum)}</div>
                                </div>
                            </div>

                            {/* Mã giảm giá */}
                            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Nhập mã giảm giá (nếu có)"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef4', fontSize: 14 }}
                                    disabled={!!couponApplied} // disable khi đã áp dụng
                                />
                                <button
                                    className="apply-btn"
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode && !couponApplied} // nếu rỗng và chưa apply => disable
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: couponApplied ? '#ef4444' : '#2563eb',
                                        color: '#fff',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {couponApplied ? 'Hủy bỏ' : (promotionsLoading ? 'Đang tải...' : 'Áp dụng')}
                                </button>
                            </div>

                            {couponApplied && (
                                <div style={{ marginTop: 8, fontSize: 13, color: '#065f46', fontWeight: 700 }}>
                                    Mã áp dụng: {couponApplied.promoName} — {couponApplied.code}
                                </div>
                            )}
                        </div>
                        <div className="total-row">
                            <div className="label">Giảm giá</div>
                            <div className="value" style={{ color: discountPercent ? '#065f46' : '#94a3b8' }}>-{formatPrice(discountAmount)}</div>
                        </div>

                        <div className="total-row">
                            <div className="label">Tiền cọc đã đặt cọc</div>
                            <div className="value">-{formatPrice(depositAmount)}</div>
                        </div>

                        <div className="total-row" style={{ borderTop: '1px solid #eef2f6', fontSize: 18, fontWeight: 800 }}>
                            <div className="label">Tổng thanh toán</div>
                            <div className="value">{formatPrice(finalTotal)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Modal */}
            {showQRModal && (
                <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowQRModal(false)} style={{ position: 'absolute', right: 12, top: 12, border: 'none', background: 'transparent' }}>
                            <X />
                        </button>

                        <h3 style={{ marginTop: 0 }}>Quét mã QR để thanh toán (demo)</h3>
                        <p style={{ color: '#64748b' }}>
                            Ứng dụng: {selectedMethod === 'momo' ? 'MoMo' : (selectedMethod === 'bank-transfer' ? 'Ngân hàng' : 'Ví điện tử')}
                        </p>

                        <img src={paymentMethods.find(m => m.id === selectedMethod)?.qr || '/qrimage/placeholder.png'} alt="QR Code" className="qr-image" />

                        <button
                            className="qr-confirm-btn"
                            onClick={() => { setShowQRModal(false); showToast('Đã (giả) hoàn tất thanh toán — demo', 'success'); }}
                        >
                            Tôi đã thanh toán
                        </button>
                    </div>
                </div>
            )}

            {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            {!embedded && <Footer />}
        </div>
    );
};

export default CheckOutPage;

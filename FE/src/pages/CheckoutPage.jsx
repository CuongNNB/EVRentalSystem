// CheckOutPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, Shield, Check, Calendar, MapPin, Clock, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CheckoutPage.css'; // CSS mới của bạn

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
        { id: 'momo', name: 'Ví MoMo', description: 'Thanh toán nhanh chóng qua ví MoMo', icon: Smartphone, color: '#d946ef', qr: '/qrimage/momo_qr.png' },
        {
            id: 'vietqr',
            name: 'Chuyển khoản ngân hàng',
            description: 'Quét mã VietQR để chuyển khoản tới VietinBank',
            icon: Wallet,
            color: '#0ea5a3',
            // note: không đặt qr tĩnh ở đây; sẽ build URL động khi cần hiển thị
            qr: null,
            // thông tin tài khoản được embed để gửi khi gọi API nếu cần
            qrMeta: {
                bankId: 'vietinbank',
                accountNo: '106878468586',
                accountName: 'NGUYEN NGOC BAO CUONG',
                template: 'TgCTXTW'
            }
        },
        
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

    // --- handle VNPay return redirect ---
    useEffect(() => {
        // Kiểm tra nếu URL hiện tại chứa các tham số VNPay trả về
        const search = window.location.search;
        if (search.includes('vnp_ResponseCode')) {
            (async () => {
                try {
                    const resp = await fetch(`http://localhost:8084/EVRentalSystem/api/vnpay/return${search}`);
                    const data = await resp.json().catch(() => ({}));

                    if (resp.ok && data.redirectUrl) {
                        showToast(data.message || 'Thanh toán thành công', 'success');
                        // Đợi 1 chút để user đọc thông báo rồi điều hướng
                        setTimeout(() => navigate(data.redirectUrl), 1000);
                    } else {
                        showToast(data.message || 'Thanh toán thất bại', 'error');
                        setTimeout(() => navigate('/payment-failed'), 1000);
                    }
                } catch (err) {
                    console.error('VNPay return fetch error:', err);
                    showToast('Lỗi khi xử lý kết quả thanh toán', 'error');
                    setTimeout(() => navigate('/payment-failed'), 1000);
                }
            })();
        }
    }, [navigate]);


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

            let ms = e.getTime() - s.getTime();
            if (ms < 0) ms = 0;

            const totalMinutes = Math.floor(ms / (1000 * 60));
            const minutesPart = totalMinutes % 60;
            let totalHours = Math.floor(totalMinutes / 60);

            // Làm tròn theo quy tắc 30 phút
            if (minutesPart >= 30) {
                totalHours += 1;
            }

            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;

            // Định dạng để hiển thị thân thiện
            let formatted = '';
            if (days > 0) {
                formatted = `${days} ngày${hours > 0 ? ' ' + hours + ' giờ' : ''}`;
            } else {
                if (hours > 0) {
                    formatted = `${hours} giờ`;
                } else {
                    // < 1 giờ: hiển thị phút (ít nhất 1 phút nếu totalMinutes là 0 thì giữ 0 phút)
                    const minutesToShow = Math.max(0, minutesPart);
                    formatted = `${minutesToShow} phút`;
                }
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

    // --- START: VNPay helper ---
    const createVnPayPayment = async ({ bookingId, amount, locale = 'vn' }) => {
        try {
            setPaying(true);
            const url = 'http://localhost:8084/EVRentalSystem/api/vnpay/create';
            const body = {
                amount: amount, // theo bạn: finalTotal
                orderInfo: `Thanh toán đơn hàng #${bookingId}`,
                orderId: String(bookingId),
                locale: locale
            };

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!resp.ok) {
                const txt = await resp.text().catch(() => null);
                throw new Error(`Server trả về ${resp.status} ${txt ? '- ' + txt : ''}`);
            }

            const data = await resp.json().catch(() => ({}));
            const paymentUrl = data.paymentUrl || data.paymentURL || data.url;
            if (!paymentUrl) throw new Error('Backend không trả về paymentUrl');

            // mở tab mới để user thực hiện thanh toán trên VNPay
            window.open(paymentUrl, '_blank');

            return { paymentUrl, orderId: data.orderId ?? null };
        } catch (err) {
            console.error('createVnPayPayment error', err);
            throw err;
        } finally {
            setPaying(false);
        }
    };
    // --- END: VNPay helper ---


    const handlePayment = async () => {
        if (!selectedMethod) {
            showToast('Vui lòng chọn phương thức thanh toán', 'error');
            return;
        }

        // Nếu user chọn ví điện tử (ewallet) -> dùng VNPay (theo yêu cầu)
        if (selectedMethod === 'ewallet') {
            try {
                if (!summary) {
                    showToast('Không có thông tin booking để thực hiện thanh toán', 'error');
                    return;
                }

                // Lấy bookingId từ summary (ưu tiên contractCode / bookingId / id)
                const bookingId = summary.contractCode ?? summary.bookingId ?? summary.id ?? null;
                if (!bookingId) {
                    showToast('Không xác định được bookingId', 'error');
                    return;
                }

                // finalTotal đã được tính trong file của bạn
                const amountToPay = Number(finalTotal || 0);
                if (!amountToPay || isNaN(amountToPay) || amountToPay <= 0) {
                    showToast('Giá trị thanh toán không hợp lệ', 'error');
                    return;
                }

                // Gửi đúng body theo yêu cầu bạn nêu
                // NOTE: nếu backend/VnPayService yêu cầu amount = vnp_Amount (amount * 100), hãy đổi:
                // const amountToSend = amountToPay * 100;
                const amountToSend = amountToPay;

                const res = await createVnPayPayment({
                    bookingId,
                    amount: amountToSend,
                    locale: 'vn'
                });

                showToast('Đang chuyển tới VNPay...', 'info');
                console.info('VNPay create response:', res);

                // (Tùy) Lưu res.orderId nếu cần đối soát
            } catch (err) {
                console.error('Lỗi khi khởi tạo VNPay', err);
                showToast('Không thể khởi tạo VNPay: ' + (err.message || ''), 'error');
            }
            return;
        }

        // các phương thức khác giữ luồng cũ (QR modal)
        setShowQRModal(true);
    };


    // Gọi API khi người dùng xác nhận "Tôi đã thanh toán"
    const handleConfirmPayment = async () => {
        try {
            if (!summary) {
                showToast && showToast('Không có thông tin booking để thực hiện thanh toán', 'error');
                return;
            }

            // Lấy bookingId: cố gắng lấy từ các trường phổ biến
            const rawBookingId = summary.contractCode ?? summary.bookingId ?? summary.id ?? null;
            const bookingIdParsed = Number.isInteger(Number(rawBookingId)) ? Number(rawBookingId) : null;

            if (!bookingIdParsed) {
                showToast && showToast('BookingId không hợp lệ — không thể gửi yêu cầu thanh toán', 'error');
                console.error('Invalid bookingId from summary:', rawBookingId, 'summary:', summary);
                return;
            }

            // promotionId có thể null
            const promotionId = couponApplied ? (couponApplied.id ?? couponApplied.promotionId ?? null) : null;

            // totalCharge: dùng giá trị bạn đã tính (finalTotal) hoặc fallback sang summary.totalEstimate...
            const totalCharge = Number(rentalTotal + extraFeesSum - depositAmount - discountAmount);

            if (!totalCharge) {
                // nếu totalCharge = 0 thì vẫn có thể hợp lệ, nhưng log để kiểm tra
                console.warn('totalCharge is falsy:', totalCharge, { finalTotal, summary });
            }

            const body = {
                bookingId: bookingIdParsed,
                promotionId: promotionId, // null nếu không có khuyến mãi
                total: totalCharge
            };

            setPaying(true);

            // Endpoint mới (không chứa bookingId trong URL)
            const url = 'http://localhost:8084/EVRentalSystem/api/bookings/payment';

            console.info('Sending payment update to', url, 'body:', body);

            const resp = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                    // nếu cần auth: 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            // cố parse JSON (nếu response không phải JSON thì respJson = {})
            const respJson = await resp.json().catch(() => ({}));

            if (resp.ok) {
                const msg = respJson.message ?? 'Thanh toán cập nhật thành công';
                showToast && showToast(msg, 'success');

                // đóng modal QR nếu có
                setShowQRModal && setShowQRModal(false);

                // → CHUYỂN HƯỚNG SANG TRANG TẠO REVIEW, TRUYỀN bookingId QUA state
                // Giữ delay nhỏ để user kịp thấy toast/modal
                setTimeout(() => {
                    try {
                        navigate('/create-review', { state: { bookingId: bookingIdParsed } });
                    } catch (navErr) {
                        console.error('Navigate to create-review failed:', navErr);
                        // fallback: quay lại trang trước
                        if (typeof navigate === 'function') navigate(-1);
                        else window.location.reload();
                    }
                }, 700);
            } else {
                // hiển thị lỗi chi tiết để debug
                const code = respJson.code ?? resp.status;
                const message = respJson.message ?? resp.statusText ?? `HTTP ${resp.status}`;
                showToast && showToast(`Lỗi (${code}): ${message}`, 'error');

                console.error('Payment update failed', {
                    status: resp.status,
                    body: respJson,
                    sentBody: body
                });
            }
        } catch (err) {
            console.error('Lỗi gọi API payment:', err);
            showToast && showToast('Lỗi khi liên hệ server. Vui lòng thử lại.', 'error');
        } finally {
            setPaying(false);
        }
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

                        <h3 style={{ marginTop: 0 }}>Quét mã QR để thanh toán</h3>
                        <p style={{ color: '#64748b' }}>
                            Ứng dụng: {selectedMethod === 'momo' ? 'MoMo' : (selectedMethod === 'bank-transfer' ? 'Ngân hàng' : 'Ví điện tử')}
                        </p>

                        {selectedMethod === 'ewallet' ? (
                            <>
                                <p style={{ color: '#374151' }}>Bạn sẽ được chuyển tới cổng thanh toán VNPay để hoàn tất (Sandbox).</p>
                                <button
                                    className="qr-confirm-btn"
                                    onClick={() => {
                                        // Gọi handlePayment để tạo VNPay và redirect
                                        handlePayment();
                                        // Đóng modal (nếu muốn)
                                        setShowQRModal(false);
                                    }}
                                    disabled={paying}
                                >
                                    {paying ? 'Đang...' : 'Thanh toán bằng VNPay'}
                                </button>
                            </>
                        ) : (
                            <>
                                {selectedMethod === 'vietqr' ? (
                                    (() => {
                                        const pm = paymentMethods.find(m => m.id === 'vietqr');
                                        const meta = pm?.qrMeta || {};
                                        // amount theo VND, dùng giá trị finalTotal (đã tính sẵn)
                                        const amount = Number(finalTotal || 0);
                                        const addInfo = `Thanh toán đơn hàng #${summary?.contractCode ?? summary?.bookingId ?? ''}`;
                                        const accountName = meta.accountName || '';
                                        // encode URI components
                                        const query = new URLSearchParams({
                                            amount: String(amount),
                                            addInfo: addInfo,
                                            accountName: accountName
                                        }).toString();
                                        const qrUrl = `https://img.vietqr.io/image/${meta.bankId}-${meta.accountNo}-${meta.template}.png?${query}`;

                                        return <img src={qrUrl} alt="VietQR Code" className="qr-image" />;
                                    })()
                                ) : (
                                    <img src={paymentMethods.find(m => m.id === selectedMethod)?.qr || '/qrimage/placeholder.png'} alt="QR Code" className="qr-image" />
                                )}

                                <button
                                    className="qr-confirm-btn"
                                    onClick={handleConfirmPayment}
                                    disabled={paying}
                                >
                                    {paying ? 'Đang xác nhận...' : 'Tôi đã thanh toán'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            {!embedded && <Footer />}
        </div>
    );
};

export default CheckOutPage;

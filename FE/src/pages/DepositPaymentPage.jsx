import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, Shield, Check, Calendar, MapPin, Clock, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DepositPaymentPage.css';

const DepositPaymentPage = () => {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const fullBooking = location.state?.fullBooking;
    const contractSummary = location.state?.contractSummary;

    const [selectedMethod, setSelectedMethod] = useState('');
    const [summary, setSummary] = useState(null);
    const [paying, setPaying] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showConfirmOverlay, setShowConfirmOverlay] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const paymentMethods = [
        {
            id: 'momo',
            name: 'Ví MoMo',
            description: 'Thanh toán nhanh chóng qua ví MoMo',
            icon: Smartphone,
            color: '#d946ef',
            qr: '/qrimage/momo_qr.png'
        },
        {
            id: 'vietqr', // Đổi ID từ bank-transfer sang vietqr để khớp logic
            name: 'Chuyển khoản ngân hàng',
            description: 'Quét mã VietQR để chuyển khoản tới VietinBank',
            icon: Wallet, // Hoặc CreditCard tuỳ bạn chọn icon
            color: '#0ea5a3',
            qr: null, // Để null vì sẽ generate link động
            qrMeta: {
                bankId: 'vietinbank',
                accountNo: '106878468586',
                accountName: 'NGUYEN NGOC BAO CUONG',
                template: 'TgCTXTW'
            }
        },
    ];

    useEffect(() => {
        // nếu không có cả contractSummary lẫn fullBooking thì không set summary
        if (!contractSummary && !fullBooking) return;

        // ưu tiên contractSummary nếu có, ngược lại build summary từ fullBooking
        const sourceContractData = contractSummary?.contractData;
        const sourceBookingData = contractSummary?.bookingData;

        // nếu contractSummary không có, thử lấy từ fullBooking
        const fb = fullBooking;
        const fallbackContractData = fb ? {
            renter: {
                name: fb.user?.name,
                email: fb.user?.email,
                phone: fb.user?.phone,
                address: fb.user?.address || 'Không rõ'
            },

            car: {
                name: fb.carData?.name,
                licensePlate: fb.carData?.licensePlate,
                color: fb.carData?.color,
                price: fb.totals?.dailyPrice,
                rentalDays: `${fb.totals?.days} ngày`,
                totalAmount: fb.totals?.totalRental,
                deposit: fb.totals?.deposit
            },
            rental: fb.bookingForm || {}
        } : null;

        const contractData = sourceContractData || fallbackContractData;
        const bookingData = sourceBookingData || (fb ? { bookingForm: fb.bookingForm, bookingPayload: fb.bookingPayload } : null);

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
            _raw: { contractData, bookingData, fullBooking: fb }
        };

        setSummary(summaryData);
    }, [contractSummary, fullBooking]);

    // Toast
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    // Định dạng tiền
    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    // Mở modal QR/ phương thức
    const handlePayment = async () => {
        if (!selectedMethod) {
            showToast('Vui lòng chọn phương thức thanh toán', 'error');
            return;
        }
        setShowQRModal(true);
    };

    // Extract bookingId robust
    const extractBookingId = () => {
        if (fullBooking) {
            const fbCandidates = [
                fullBooking.response?.bookingId,
                fullBooking.response?.id,
                fullBooking.bookingId,
                fullBooking.booking_id,
                fullBooking.id,
                fullBooking.bookingPayload?.bookingId,
                fullBooking.bookingPayload?.id
            ];
            console.log('[DepositPayment] fullBooking candidates:', fbCandidates);
            for (const c of fbCandidates) {
                if (c === undefined || c === null || c === '') continue;
                if (typeof c === 'object') continue;
                const n = Number(c);
                if (!Number.isNaN(n) && Number.isFinite(n)) return { numeric: n, raw: c };
            }
        }

        if (contractSummary) {
            const { contractData, bookingData } = contractSummary;
            const contractCandidates = [
                bookingData?.bookingPayload?.id,
                bookingData?.bookingId,
                bookingData?.response?.id,
                bookingData?.response?.bookingId,
                contractData?.bookingId
            ];
            console.log('[DepositPayment] contractSummary candidates:', contractCandidates);
            for (const c of contractCandidates) {
                if (c === undefined || c === null || c === '') continue;
                const n = Number(c);
                if (!Number.isNaN(n) && Number.isFinite(n)) return { numeric: n, raw: c };
            }

            const stringCandidates = [
                bookingData?.bookingPayload?.bookingId,
                bookingData?.response?.bookingCode,
                contractData?.contractId,
                contractData?.renter?.bookingId,
                bookingData?.bookingCode
            ];
            for (const s of stringCandidates) {
                if (s !== undefined && s !== null && s !== '') return { code: String(s), raw: s };
            }
        }

        const fallback = fullBooking?.bookingPayload?.id ?? fullBooking?.bookingPayload ?? contractSummary?.contractData?.contractId;
        if (fallback) {
            const maybeNum = Number(fallback);
            if (!Number.isNaN(maybeNum) && Number.isFinite(maybeNum)) return { numeric: maybeNum, raw: fallback };
            return { raw: fallback };
        }

        return null;
    };

    const handleBankTransferConfirm = async () => {
        setShowQRModal(false);

        console.log('[DepositPayment] contractSummary:', contractSummary);
        console.log('[DepositPayment] fullBooking:', fullBooking);

        const extracted = extractBookingId();
        console.log('[DepositPayment] extracted booking identifier:', extracted);

        if (!extracted) {
            showToast('Không tìm thấy bookingId để xác nhận đặt cọc. Vui lòng thử lại hoặc liên hệ hỗ trợ.', 'error');
            setShowConfirmOverlay(true);
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        const payload = {};
        if (extracted.numeric !== undefined) payload.bookingId = extracted.numeric;
        else if (extracted.code) payload.contractCode = extracted.code;
        else if (extracted.raw) {
            const maybeNum = Number(extracted.raw);
            if (!Number.isNaN(maybeNum) && Number.isFinite(maybeNum)) payload.bookingId = maybeNum;
            else payload.contractCode = String(extracted.raw);
        }

        console.log('[DepositPayment] Confirm payload ->', payload);

        setPaying(true);
        try {
            const resp = await fetch('http://localhost:8084/EVRentalSystem/api/bookings/confirm-deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const text = await resp.text().catch(() => null);
            let parsed = null;
            try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = null; }

            console.log('[DepositPayment] HTTP status:', resp.status);
            console.log('[DepositPayment] Raw response text:', text);
            console.log('[DepositPayment] Parsed response json:', parsed);

            if (!resp.ok) {
                const serverMessage = (parsed && (parsed.message || parsed.error)) || text || `HTTP ${resp.status}`;
                throw new Error(serverMessage);
            }
            if (parsed && parsed.success === false) {
                const serverMessage = parsed.message || 'Server trả success=false';
                throw new Error(serverMessage);
            }

            showToast('Xác nhận đặt cọc thành công', 'success');
            setShowConfirmOverlay(true);
            setTimeout(() => navigate('/'), 2500);
        } catch (error) {
            console.error('[DepositPayment] confirm-deposit error:', error);
            const msg = (error && error.message) ? error.message : 'Xác nhận đặt cọc thất bại';
            showToast(`Thất bại: ${msg}`, 'error');
            setShowConfirmOverlay(true);
            setTimeout(() => navigate('/'), 3000);
        } finally {
            setPaying(false);
        }
    };

    if (!summary) {
        return (
            <>
                <Header />
                <div className="deposit-payment-page">

                    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: 20, color: '#6b7280' }}>Không tìm thấy thông tin hợp đồng</h1>
                    </main>

                </div>
                <Footer />
            </>
        );
    }

    // derived values for display
    const summaryData = summary;
    const depositAmount = summaryData?.depositAmount ?? 0;
    const pricePerDay = summaryData?.pricePerDay ?? 0;
    const rentalDays = summaryData?.days ?? '1 ngày 0 giờ';
    const stationName = summaryData?.rental?.pickupLocation ?? fullBooking?.bookingPayload?.pickupLocation ?? 'Không rõ';
    const startTimeDisplay = summaryData?.rental?.startDate ?? summaryData?.rental?.pickupDateTime ?? (fullBooking?.bookingPayload?.startTime || fullBooking?.startTime);
    const endTimeDisplay = summaryData?.rental?.endDate ?? summaryData?.rental?.returnDateTime ?? (fullBooking?.bookingPayload?.expectedReturnTime || fullBooking?.expectedReturnTime);

    return (
        <div className="deposit-payment-page">
            <Header />

            <div className="dp-container">
                <div className="dp-header" style={{ gridColumn: '1 / -1' }}>
                    <h1>Chọn phương thức thanh toán</h1>
                    <p className="lead">Chọn phương thức phù hợp và hoàn tất tiền đặt cọc để xác nhận đơn thuê.</p>
                </div>

                {/* LEFT */}
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

                        <div className="secure-note" style={{ marginTop: 18 }}>
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
                            style={{ background: 'linear-gradient(135deg,#0bb97f,#06b6d4)' }}
                        >
                            {paying ? 'Đang xử lý...' : 'Xác nhận đặt cọc'}
                        </button>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="summary-col">
                    <div className="order-summary">
                        <div className="summary-header">
                            <h3>Thông tin đặt xe</h3>
                        </div>

                        <div className="summary-body">
                            <div className="summary-row">
                                <div className="label"><Calendar style={{ marginRight: 8 }} />Ngày nhận xe</div>
                                <div className="value">{startTimeDisplay || '—'}</div>
                            </div>

                            <div className="summary-row">
                                <div className="label"><Clock style={{ marginRight: 8 }} />Ngày trả xe</div>
                                <div className="value">{endTimeDisplay || '—'}</div>
                            </div>

                            <div className="summary-row">
                                <div className="label">
                                    <MapPin style={{ marginRight: 8 }} />Địa điểm nhận xe</div>
                                <div className="value" style={{ fontSize: '12px', fontWeight: 600 }}>
                                    {stationName}
                                </div>
                            </div>

                            <div className="summary-row">
                                <div className="label">Giá thuê/ngày</div>
                                <div className="value">{formatPrice(pricePerDay)}</div>
                            </div>

                            <div className="summary-row">
                                <div className="label">Thời gian thuê</div>
                                <div className="value">{rentalDays}</div>
                            </div>

                            <div className="summary-row">
                                <div className="label">Đặt cọc (30%)</div>
                                <div className="value">{formatPrice(depositAmount)}</div>
                            </div>
                        </div>

                        <div className="total-row">
                            <div className="label">Tổng thanh toán</div>
                            <div className="value">{formatPrice(depositAmount)}</div>
                        </div>

                        <div className="note">Thanh toán an toàn với ngân hàng, ví điện tử hoặc quét mã QR.</div>
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
                        {/* ... code mới ... */}
                        {selectedMethod === 'vietqr' ? (
                            (() => {
                                const pm = paymentMethods.find(m => m.id === 'vietqr');
                                const meta = pm?.qrMeta || {};

                                // QUAN TRỌNG: Ở DepositPage biến chứa tiền là depositAmount (khác với finalTotal ở Checkout)
                                const amount = Number(depositAmount || 0);

                                // Nội dung chuyển khoản: "Dat coc [Mã hợp đồng]"
                                const codeInfo = summaryData?.contractCode || extractBookingId()?.code || 'Booking';
                                const addInfo = `Dat coc ${codeInfo}`;

                                const accountName = meta.accountName || '';

                                // Tạo URL VietQR
                                const query = new URLSearchParams({
                                    amount: String(amount),
                                    addInfo: addInfo,
                                    accountName: accountName
                                }).toString();

                                const qrUrl = `https://img.vietqr.io/image/${meta.bankId}-${meta.accountNo}-${meta.template}.png?${query}`;

                                return <img src={qrUrl} alt="VietQR Code" className="qr-image" />;
                            })()
                        ) : (
                            // Các phương thức khác (Momo,...) dùng ảnh tĩnh như cũ
                            <img
                                src={paymentMethods.find(m => m.id === selectedMethod)?.qr || '/qrimage/placeholder.png'}
                                alt="QR Code"
                                className="qr-image"
                            />
                        )}

                        <button
                            className="qr-confirm-btn"
                            onClick={handleBankTransferConfirm}
                            disabled={paying}
                            style={{ marginTop: 14, width: '100%', background: 'linear-gradient(135deg,#0bb97f,#06b6d4)' }}
                        >
                            {paying ? 'Đang xác nhận...' : 'Tôi đã thanh toán'}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm overlay */}
            {showConfirmOverlay && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ textAlign: 'center' }}>
                            <h3>Chúng tôi sẽ sớm xác nhận đơn hàng của quý khách</h3>
                            <p>Bạn có thể liên hệ qua hotline để xác nhận ngay!</p>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            <Footer />
        </div>
    );
};

export default DepositPaymentPage;

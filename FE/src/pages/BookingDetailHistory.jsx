import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MOCK_BOOKINGS, getStatusLabel } from '../mocks/bookings';
import './BookingDetailHistory.css';

const API_BASE = 'http://localhost:8084/EVRentalSystem/api';

// Map bookingStatus enum → Vietnamese text
const getStatusText = (status) => {
    if (!status) return 'Không xác định';
    switch (status) {
        case 'Pending_Deposit_Confirmation':
            return 'Chờ thanh toán cọc';
        case 'Pending_Contract_Signing':
            return 'Chờ ký hợp đồng';
        case 'Pending_Vehicle_Pickup':
            return 'Chờ nhận xe';
        case 'Vehicle_Inspected_Before_Pickup':
            return 'Xe đang kiểm tra trước khi giao';
        case 'Vehicle_Pickup_Overdue':
            return 'Quá hạn nhận xe';
        case 'Currently_Renting':
            return 'Đang thuê xe';
        case 'Vehicle_Returned':
            return 'Xe đã trả';
        case 'Total_Fees_Charged':
            return 'Đã tính tổng chi phí';
        case 'Completed':
            return 'Hoàn tất';
        case 'Vehicle_Return_Overdue':
            return 'Quá hạn trả xe';
        default:
            return 'Không xác định';
    }
};


const fmtVND = (amount) => (amount ?? 0).toLocaleString("vi-VN") + " ₫";

const fmtDateTime = (isoString) => {
    if (!isoString) return '---';
    return new Date(isoString).toLocaleString("vi-VN", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const BookingDetailHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [booking, setBooking] = useState(null);
    const [inspections, setInspections] = useState([]);
    const [loadingInsp, setLoadingInsp] = useState(true);
    const [errorInsp, setErrorInsp] = useState(null);

    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    // Prefer booking from navigation state (forwarded from MyBookings)
    useEffect(() => {
        const bookingFromState = location?.state?.booking;
        if (bookingFromState) {
            setBooking(bookingFromState);
            return;
        }

        // fallback: try to find in MOCK_BOOKINGS by id
        const found = MOCK_BOOKINGS.find(b => b.bookingId === parseInt(id));
        setBooking(found || null);
    }, [id, location]);

    // Fetch inspection details by bookingId (use booking.bookingId if available, otherwise URL param id)
    useEffect(() => {
        const bookingIdToUse = booking?.bookingId ? booking.bookingId : (id ? parseInt(id) : null);
        if (!bookingIdToUse) return;

        const fetchInspections = async () => {
            try {
                setLoadingInsp(true);
                setErrorInsp(null);

                const resp = await fetch(`${API_BASE}/inspections/by-booking`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId: bookingIdToUse }),
                });

                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    throw new Error(err.message || `HTTP ${resp.status}`);
                }
                const data = await resp.json();
                setInspections(Array.isArray(data) ? data : []);
            } catch (err) {
                setErrorInsp(err.message);
            } finally {
                setLoadingInsp(false);
            }
        };

        fetchInspections();
    }, [booking, id]);

    if (!booking) {
        return (
            <div className="detail-page">
                <Header />
                <div className="detail-container">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="detail-not-found">
                        <div className="not-found-icon">❌</div>
                        <h2 className="not-found-title">Không tìm thấy đơn #{id}</h2>
                        <p className="not-found-text">Vui lòng mở trang <strong>Lịch sử đặt xe</strong> và bấm "Xem chi tiết" để chuyển dữ liệu, hoặc thử lại bằng cách truy cập đúng URL.</p>
                        <button onClick={() => navigate('/my-bookings')} className="not-found-button">
                            ← Về lịch sử đặt xe
                        </button>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    // Normalize some fields for display (booking may come from API raw object or mapped object)
    const normalized = {
        bookingId: booking.bookingId,
        vehicleBrand: booking.brand ?? booking.vehicleBrand,
        vehicleModel: booking.vehicleModel ?? booking.model ?? '',
        licensePlate: booking.licensePlate ?? booking.plate ?? 'Đang cập nhật',
        odo: booking.odo ?? 'Đang cập nhật',
        status: booking.bookingStatus ?? booking.status,
        stationName: booking.stationName ?? booking.station,
        stationAddress: booking.stationAddress ?? booking.stationAddress,
        startAt: booking.startTime ?? booking.startAt ?? booking.createdAt ?? null,
        endAt: booking.expectedReturnTime ?? booking.endAt ?? null,
        actualReturnTime: booking.actualReturnTime ?? booking.actualReturnTime ?? null,
        deposit: booking.deposit ?? booking.deposit ?? 0,
        extrasFee: booking.extrasFee ?? booking.extrasFee ?? 0,
        pricePerHour: booking.pricePerHour ?? booking.pricePerHour ?? 0,
        totalPrice: booking.totalPrice ?? booking.totalPrice ?? 0,
        color: booking.color ?? 'Đang cập nhật',
        batteryCapacity: booking.batteryCapacity ?? 'Đang cập nhật',
        contractUrl: booking.contractUrl ?? null,
        invoiceUrl: booking.invoiceUrl ?? null,
        raw: booking,
    };

    // compute days, estimated and total for display
    const computePriceData = () => {
        const start = normalized.startAt ? new Date(normalized.startAt) : null;
        const end = normalized.endAt ? new Date(normalized.endAt) : null;
        let days = 0;
        if (start && end) {
            const diffMs = end.getTime() - start.getTime();
            days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        }
        const deposit = normalized.deposit ?? 0;
        const extrasFee = normalized.extrasFee ?? 0;
        const estimated = Math.round(deposit / 0.3); // deposit*(1+0.3)
        const total = estimated + extrasFee;
        return { days, deposit, extrasFee, estimated, total };
    };

    const { days, deposit, extrasFee, estimated, total } = computePriceData();

    // 🔹 ADD: call API to update inspections' status for a bookingId
    const callUpdateStatusApi = async (bookingId, status) => {
        setUpdating(true);
        setUpdateError(null);
        try {
            const resp = await fetch(`${API_BASE}/inspections/update-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, status }),
            });

            if (!resp.ok) {
                const errBody = await resp.json().catch(() => ({}));
                throw new Error(errBody.message || `HTTP ${resp.status}`);
            }

            // backend returns List<Inspection>
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                setInspections(data);
            } else {
                // fallback: mark local inspections with new status
                setInspections(prev => prev.map(i => ({ ...i, status })));
            }

            return { success: true };
        } catch (err) {
            setUpdateError(err.message);
            return { success: false, message: err.message };
        } finally {
            setUpdating(false);
        }
    };

    // 🔹 ADD: handlers for Accept modal
    const handleAcceptAll = async () => {
        if (!normalized.bookingId) return;
        // mở modal trước để người dùng thấy thông báo
        setAcceptModalOpen(true);
        // gọi API cập nhật status -> CONFIRMED
        await callUpdateStatusApi(normalized.bookingId, 'CONFIRMED');
    };

    const handleAcceptClose = () => {
        setAcceptModalOpen(false);
    };
    // 🔹 Mở modal hỏi xác nhận khi nhấn Từ chối
    const handleOpenRejectModal = () => {
        setRejectModalOpen(true);
    };

    // 🔹 Hủy đóng modal (khi nhấn "Huỷ")
    const handleRejectCancel = () => {
        setRejectModalOpen(false);
    };

    // 🔹 Xác nhận từ chối: gọi API cập nhật status -> REJECTED
    const handleRejectConfirm = async () => {
        setRejectModalOpen(false);
        if (!normalized.bookingId) return;

        const result = await callUpdateStatusApi(normalized.bookingId, "REJECTED");

        // ✅ Nếu API trả về success, reload lại trang
        if (result.success) {
            window.location.reload();
        } else {
            alert("Cập nhật thất bại: " + (result.message || "Lỗi không xác định"));
        }
    };


    return (
        <div className="detail-page">
            <Header />
            <div className="detail-container">

                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Quay lại</span>
                </motion.button>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="detail-header">
                    <div className="detail-header-top">
                        <h1 className="detail-title">Chi tiết đơn #{normalized.bookingId}</h1>
                        <span className={`detail-status-badge status-${(normalized.status || 'unknown').toLowerCase()}`}>
              {getStatusText(normalized.status)}
            </span>
                    </div>
                    <p className="detail-subtitle">Thông tin chi tiết về đơn đặt xe</p>
                </motion.div>

                {/* Sections */}
                <div className="detail-sections">

                    {/* Vehicle */}
                    <motion.div className="detail-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="section-header"><span className="section-title">Thông tin xe</span></h2>
                        <div className="vehicle-info-grid">
                            <div className="info-column">
                                <div className="info-row"><span className="info-label">Hãng:</span><span className="info-value">{normalized.vehicleBrand}</span></div>
                                <div className="info-row"><span className="info-label">Model:</span><span className="info-value">{normalized.vehicleModel}</span></div>
                                <div className="info-row"><span className="info-label">Biển số:</span><span className="info-value">{normalized.licensePlate}</span></div>
                            </div>
                            <div className="info-column">
                                <div className="info-row"><span className="info-label">Màu:</span><span className="info-value">{normalized.color}</span></div>
                                <div className="info-row"><span className="info-label">Pin:</span><span className="info-value">{normalized.batteryCapacity}</span></div>
                                <div className="info-row"><span className="info-label">Odo:</span><span className="info-value">{normalized.batteryCapacity}</span></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Station */}
                    <motion.div className="detail-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="section-header"><span className="section-title">Địa điểm nhận xe</span></h2>
                        <div className="station-info">
                            <div className="station-name">{normalized.stationName}</div>
                            <div className="station-address">{normalized.stationAddress}</div>
                        </div>
                    </motion.div>

                    {/* Time (vertical rows) */}
                    <motion.div className="detail-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="section-header"><span className="section-title">Thời gian thuê</span></h2>
                        <div className="time-vertical">
                            <div className="time-row">
                                <span className="time-label">Bắt đầu:</span>
                                <span className="time-value">{fmtDateTime(normalized.startAt)}</span>
                            </div>
                            <div className="time-row">
                                <span className="time-label">Kết thúc (dự kiến):</span>
                                <span className="time-value">{fmtDateTime(normalized.endAt)}</span>
                            </div>
                            <div className="time-row">
                                <span className="time-label">Ngày trả thực tế:</span>
                                <span className="time-value">{normalized.actualReturnTime ? fmtDateTime(normalized.actualReturnTime) : 'Đang cập nhật'}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Price */}
                    <motion.div className="detail-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="section-header"><span className="section-title">Chi phí</span></h2>

                        <div className="price-list">
                            <div className="price-row">
                                <span className="price-label">Số ngày thuê:</span>
                                <span className="price-value">{days} ngày</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">Tiền dự tính:</span>
                                <span className="price-value">{fmtVND(estimated)}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">Đặt cọc:</span>
                                <span className="price-value">{fmtVND(deposit)}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">Phụ phí:</span>
                                <span className="price-value">{fmtVND(extrasFee)}</span>
                            </div>
                            <div className="price-total">
                                <span className="price-total-label">Tổng thanh toán:</span>
                                <span className="price-total-value">{fmtVND(total)}</span>
                            </div>

                            <div className="price-actions">
                                <button
                                    className="btn-pay"
                                    onClick={() => {
                                        navigate('/checkout', { state: { booking: normalized } });
                                    }}
                                >
                                    Thanh toán
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Inspection */}
                    <motion.div className="detail-card inspection-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="section-header"><span className="section-title">Kiểm tra tình trạng xe</span></h2>

                        {loadingInsp && <p>🔄 Đang tải thông tin kiểm tra...</p>}
                        {errorInsp && <p className="text-error">Đang cập nhật tình trạng kiểm tra xe...</p>}

                        {!loadingInsp && !errorInsp && inspections.length === 0 && (
                            <p>Không có dữ liệu kiểm tra nào cho đơn này.</p>
                        )}

                        <div className="inspection-list">
                            {inspections.map((insp) => (
                                <div key={insp.inspectionId} className="inspection-item">
                                    <div className="inspection-info">
                                        <div><strong>Phần:</strong> {insp.partName}</div>
                                        <div><strong>Trạng thái:</strong> {insp.status}</div>
                                        <div><strong>Nhân viên:</strong> {insp.staffName}</div>
                                        <div><strong>Thời gian:</strong> {fmtDateTime(insp.inspectedAt)}</div>
                                        <div><strong>Mô tả:</strong> {insp.description || '---'}</div>
                                    </div>
                                    {insp.pictureUrl && (
                                        <div className="inspection-image-box">
                                            <img src={insp.pictureUrl} alt={insp.partName} className="inspection-image" />
                                            <a href={insp.pictureUrl} target="_blank" rel="noreferrer" className="document-view-link">Xem ảnh lớn</a>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {inspections.length > 0 && (
                                <div className="inspection-actions">
                                    <button
                                        className="btn-accept"
                                        onClick={handleAcceptAll}
                                        disabled={updating}
                                        title={updating ? "Đang xử lý..." : "Chấp nhận tất cả"}
                                    >
                                        {updating ? 'Đang xử lý...' : 'Chấp nhận'}
                                    </button>

                                    <button
                                        className="btn-reject"
                                        onClick={handleOpenRejectModal}
                                        disabled={updating}
                                        style={{ marginLeft: 12 }}
                                        title={updating ? "Đang xử lý..." : "Từ chối"}
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
            {/* 🔹 ACCEPT MODAL */}
            {acceptModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-card">
                        <h3>Xe bạn đặt sẽ sớm được chuẩn bị</h3>
                        <p>Đội ngũ của chúng tôi sẽ chuẩn bị xe cho bạn trong thời gian sớm nhất. Cảm ơn bạn đã đặt xe!</p>

                        {updating && <p style={{ marginTop: 8 }}>Đang gửi yêu cầu...</p>}
                        {updateError && <p className="text-error" style={{ marginTop: 8 }}>{updateError}</p>}

                        <div className="modal-actions" style={{ marginTop: 12 }}>
                            <button
                                className="modal-btn modal-confirm"
                                onClick={handleAcceptClose}
                                disabled={updating}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 🔹 REJECT CONFIRMATION MODAL */}
            {rejectModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-card">
                        <h3>Bạn có chắc không?</h3>
                        <p>
                            Bạn đang từ chối kết quả kiểm tra xe cho đơn #{normalized.bookingId}.<br />
                            Hành động này sẽ cập nhật trạng thái tất cả mục kiểm tra thành{" "}
                            <strong>REJECTED</strong>.
                        </p>

                        {updating && <p style={{ marginTop: 8 }}>Đang gửi yêu cầu...</p>}
                        {updateError && <p className="text-error" style={{ marginTop: 8 }}>{updateError}</p>}

                        <div className="modal-actions" style={{ marginTop: 12 }}>
                            <button
                                className="modal-btn modal-cancel"
                                onClick={handleRejectCancel}
                                disabled={updating}
                            >
                                Huỷ
                            </button>
                            <button
                                className="modal-btn modal-confirm"
                                onClick={handleRejectConfirm}
                                disabled={updating}
                            >
                                {updating ? "Đang xử lý..." : "Xác nhận từ chối"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default BookingDetailHistory;

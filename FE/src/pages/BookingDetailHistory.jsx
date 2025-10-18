import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import './BookingHistory.css';

const normalizeStatus = (s = '') => String(s || '').toString().trim().toUpperCase();

const STATUS_LABEL = {
  RENTING: 'Đang thuê',
  IN_PROGRESS: 'Đang thuê',
  RENTED: 'Đang thuê',
  UPCOMING: 'Chờ nhận xe',
  PENDING: 'Chờ nhận xe',
  COMPLETED: 'Đã hoàn tất',
  DONE: 'Đã hoàn tất',
  RETURNED: 'Đã hoàn tất',
  CANCELED: 'Đã hủy',
  CANCELLED: 'Đã hủy',
};

const getStatusLabel = (s) => STATUS_LABEL[normalizeStatus(s)] || (s || 'Không xác định');

const getUserId = () => {
  try {
    const raw = localStorage.getItem('ev_user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.id ?? u?.userId ?? u?.data?.id ?? null;
  } catch {
    return null;
  }
};

// Helper functions (null-safe)
const fmtVND = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '0 ₫';
  return n.toLocaleString('vi-VN') + ' ₫';
};

const fmtDateTime = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
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

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      const userId = getUserId();
      if (!userId) {
        setError('Vui lòng đăng nhập để xem chi tiết đơn.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
  try {
  const res = await api.get(`/api/user/booking-history/${userId}`);
        const list = Array.isArray(res.data) ? res.data : [];
        const found = list.find((b) => String(b.bookingId) === String(id) || String(b.id) === String(id));
        if (found) {
          // normalize booking fields to avoid crashes in rendering
          setBooking({
            ...found,
            bookingId: found?.bookingId ?? found?.id ?? null,
            bookingStatus: found?.bookingStatus ?? found?.status ?? 'UNKNOWN',
            vehicleBrand: found?.vehicleBrand ?? '',
            vehicleModel: found?.vehicleModel ?? 'Không rõ',
            licensePlate: found?.licensePlate ?? 'Không rõ',
            stationName: found?.stationName ?? 'Không rõ',
            stationAddress: found?.stationAddress ?? '',
            startTime: found?.startTime ?? found?.startAt ?? null,
            expectedReturnTime: found?.expectedReturnTime ?? found?.endAt ?? null,
            deposit: found?.deposit ?? found?.totalPrice ?? 0,
          });
        } else setBooking(null);
      } catch (err) {
        setError('Không thể tải chi tiết đơn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="detail-page">
      <Header />

      <div className="detail-container">
        {/* Loading / Error / Not found states */}
        {loading && (
          <div className="loading" style={{padding:40,textAlign:'center'}}>
            <div className="spinner" />
            <p>Đang tải chi tiết đơn…</p>
          </div>
        )}

        {error && !loading && (
          <div className="alert error" style={{padding:20}}>
            <div>{error}</div>
            <div style={{marginTop:10}}>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          </div>
        )}

        {!loading && !error && !booking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="detail-not-found"
            style={{padding:40,textAlign:'center'}}
          >
            <div className="not-found-icon">❌</div>
            <h2 className="not-found-title">Không tìm thấy đơn</h2>
            <p className="not-found-text">Đơn đặt xe #{id} không tồn tại hoặc đã bị xóa</p>
            <button
              onClick={() => navigate('/my-bookings')}
              className="not-found-button"
            >
              ← Về lịch sử đặt xe
            </button>
          </motion.div>
        )}

        {/* If booking present, render details */}
        {(!loading && !error && booking) && (
          <>
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

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="detail-header"
        >
          <div className="detail-header-top">
            <h1 className="detail-title">Chi tiết đơn #{booking.bookingId}</h1>
            <span className={`detail-status-badge status-${String(booking?.bookingStatus ?? booking?.status ?? '').toLowerCase().replace(/_/g, '-')}`}>
              {getStatusLabel(booking.bookingStatus ?? booking.status)}
            </span>
          </div>
          <p className="detail-subtitle">Thông tin chi tiết về đơn đặt xe của bạn</p>
        </motion.div>

        {/* Main Content */}
        <div className="detail-sections">
          {/* Vehicle Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="detail-card"
          >
            <h2 className="section-header">
              <svg className="section-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <span className="section-title">Thông tin xe</span>
            </h2>
            <div className="vehicle-info-grid">
              <div className="info-column">
                <div className="info-row">
                  <span className="info-label">Hãng xe:</span>
                  <span className="info-value">{booking.vehicleBrand}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Model:</span>
                  <span className="info-value">{booking.vehicleModel}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Biển số:</span>
                  <span className="info-value">{booking.licensePlate}</span>
                </div>
              </div>
              <div className="info-column">
                <div className="info-row">
                  <span className="info-label">Màu sắc:</span>
                  <span className="info-value">{booking.color}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Dung lượng pin:</span>
                  <span className="info-value">{booking.batteryCapacity}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Station Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="detail-card"
          >
            <h2 className="section-header">
              <svg className="section-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="section-title">Địa điểm nhận xe</span>
            </h2>
            <div className="station-info">
              <div className="station-name">{booking.stationName}</div>
              <div className="station-address">{booking.stationAddress}</div>
            </div>
          </motion.div>

          {/* Time Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="detail-card"
          >
            <h2 className="section-header">
              <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="section-title">Thời gian thuê</span>
            </h2>
            <div className="time-grid">
              <div className="time-box time-box-start">
                <div className="time-label">Thời gian nhận xe</div>
                <div className="time-value">{fmtDateTime(booking.startTime)}</div>
              </div>
              <div className="time-box time-box-end">
                <div className="time-label">Thời gian trả xe</div>
                <div className="time-value">{fmtDateTime(booking.expectedReturnTime)}</div>
              </div>
            </div>
          </motion.div>

          {/* Price Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="detail-card"
          >
            <h2 className="section-header">
              <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="section-title">Chi phí</span>
            </h2>
            <div className="price-list">
              <div className="price-row">
                <span className="price-label">Giá thuê theo giờ:</span>
                <span className="price-value">{fmtVND(booking.pricePerHour)}/giờ</span>
              </div>
              <div className="price-row">
                <span className="price-label">Phụ phí:</span>
                <span className="price-value">{fmtVND(booking.extrasFee)}</span>
              </div>
              <div className="price-row">
                <span className="price-label">Đặt cọc:</span>
                <span className="price-value">{fmtVND(booking.deposit)}</span>
              </div>
              <div className="price-total">
                <span className="price-total-label">Tổng thanh toán:</span>
                <span className="price-total-value">{fmtVND(booking.deposit)}</span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="detail-card"
          >
            <h2 className="section-header">
              <span className="section-title">Thao tác</span>
            </h2>
            <div className="action-buttons">
              <a
                href={booking.contractUrl}
                className="action-btn action-btn-primary"
              >
                <span>📄 Xem hợp đồng</span>
              </a>
              <a
                href={booking.invoiceUrl}
                className="action-btn action-btn-secondary"
              >
                <span>💰 Tải hóa đơn</span>
              </a>
            </div>
          </motion.div>
        </div>
        </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BookingDetailHistory;

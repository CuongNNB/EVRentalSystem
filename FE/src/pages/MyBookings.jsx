import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import './MyBookings.css';

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

const normalizeStatus = (s = '') => String(s || '').toString().trim().toUpperCase();

const getStatusLabel = (s) => {
  return STATUS_LABEL[normalizeStatus(s)] || (s || 'Không xác định');
};

// Skeleton component
const BookingCardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  );
};

const normalizeBookingData = (bookings) => {
  return (bookings || []).map((b, idx) => ({
    ...b,
    // ensure stable id and string fallbacks for fields used with string ops
    bookingId: b?.bookingId ?? b?.id ?? `bk_${idx}`,
  // map backend fields: prefer bookingStatus, then legacy status
  bookingStatus: b?.bookingStatus ?? b?.status ?? 'UNKNOWN',
    vehicleBrand: b?.vehicleBrand ?? '',
    vehicleModel: b?.vehicleModel ?? 'Không rõ',
    licensePlate: b?.licensePlate ?? 'Không rõ',
    stationName: b?.stationName ?? 'Không rõ',
    startTime: b?.startTime ?? b?.startAt ?? null,
    expectedReturnTime: b?.expectedReturnTime ?? b?.endAt ?? null,
    deposit: b?.deposit ?? b?.totalPrice ?? 0,
  }));
};

const MyBookings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState([]);
  const pageSize = 6;

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'RENTING', label: 'Đang thuê' },
    { key: 'UPCOMING', label: 'Chờ nhận xe' },
    { key: 'COMPLETED', label: 'Đã hoàn tất' },
    { key: 'CANCELED', label: 'Đã hủy' }
  ];

  const userId = getUserId();

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('Vui lòng đăng nhập để xem lịch sử đặt xe.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const url = `/user/booking-history/${userId}`;
        const res = await api.get(url);
        const safeBookings = normalizeBookingData(res.data);
        setItems(safeBookings);
      } catch (err) {
        setError('Không thể tải danh sách đặt xe. Vui lòng thử lại sau.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Filter bookings
  const filteredBookings = items.filter((booking) => {
    // status filter
    if (activeTab !== 'ALL') {
      const s = normalizeStatus(booking.bookingStatus || "");
      switch (activeTab) {
        case 'RENTING':
          if (s !== 'RENTING' && s !== 'IN_PROGRESS' && s !== 'RENTED') return false;
          break;
        case 'UPCOMING':
          if (s !== 'UPCOMING' && s !== 'PENDING') return false;
          break;
        case 'COMPLETED':
          if (s !== 'COMPLETED' && s !== 'DONE' && s !== 'RETURNED') return false;
          break;
        case 'CANCELED':
          if (s !== 'CANCELED' && s !== 'CANCELLED') return false;
          break;
        default:
          break;
      }
    }
    // search
    if (searchQuery) {
      const q = (searchQuery || '').toString().toLowerCase();
      const model = String(booking?.vehicleModel ?? '').toLowerCase();
      const plate = String(booking?.licensePlate ?? '').toLowerCase();
      return model.includes(q) || plate.includes(q);
    }
    return true;
  });
  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  return (
    <div className="my-bookings-page">
      <Header />

      <div className="bookings-container">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bookings-header"
        >
          <h1 className="bookings-title">Lịch sử đặt xe</h1>
          <p className="bookings-subtitle">Xem và quản lý tất cả các đơn đặt xe của bạn</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bookings-tabs-wrapper"
        >
          <div className="bookings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="search-wrapper"
        >
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm theo model xe hoặc biển số..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="alert-error">
            <p className="alert-error-title">Có lỗi xảy ra</p>
            <p className="alert-error-message">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && paginatedBookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-state"
          >
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">
              Chưa có đơn ở mục này
            </h3>
            <p className="empty-description">
              {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Bạn chưa có đơn đặt xe nào'}
            </p>
            <button
              onClick={() => navigate('/cars')}
              className="empty-cta"
            >
              Đặt xe ngay
            </button>
          </motion.div>
        )}

        {/* Bookings Grid */}
        {!loading && paginatedBookings.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bookings-grid"
            >
              {paginatedBookings.map((booking, index) => {
                const statusClass = String(booking?.bookingStatus ?? booking?.status ?? '').toLowerCase().replace(/_/g, '-');
                return (
                  <motion.div
                    key={booking.bookingId ?? booking.id ?? index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="booking-card"
                    onClick={() => navigate(`/my-bookings/${booking.bookingId}`)}
                  >
                    {/* Header */}
                    <div className="card-header">
                      <div className="card-vehicle-info">
                        <h3>
                          {booking.vehicleBrand} {booking.vehicleModel}
                        </h3>
                        <p>{booking.licensePlate}</p>
                      </div>
                      <span className={`status-badge status-${statusClass}`}>
                        {getStatusLabel(booking.bookingStatus ?? booking.status)}
                      </span>
                    </div>

                    {/* Station */}
                    <div className="card-station">
                      <svg className="station-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="station-text">{booking.stationName}</span>
                    </div>

                    {/* Time */}
                    <div className="card-time">
                      <div className="time-row">
                        <svg className="time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="time-label">Từ:</span>
                        <span className="time-value">{fmtDateTime(booking.startTime)}</span>
                      </div>
                      <div className="time-row">
                        <svg className="time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="time-label">Đến:</span>
                        <span className="time-value">{fmtDateTime(booking.expectedReturnTime)}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="card-price">
                      <span className="price-label">Tổng tiền:</span>
                      <span className="price-amount">
                        {fmtVND(booking.deposit)}
                      </span>
                    </div>

                    {/* View Details Button */}
                    <button
                      className="card-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/my-bookings/${booking.bookingId}`);
                      }}
                    >
                      Xem chi tiết →
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  ← Trước
                </button>
                <div className="pagination-pages">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyBookings;

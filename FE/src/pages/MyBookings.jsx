import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MOCK_BOOKINGS, getStatusLabel, getStatusBadgeClass } from '../mocks/bookings';
import './MyBookings.css';

const API_BASE = 'http://localhost:8084/EVRentalSystem/api';

// Helper functions
const fmtVND = (amount) => {
    return (amount ?? 0).toLocaleString("vi-VN") + " ₫";
};

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

const MyBookings = () => {

    // Bắt Status ở response ====================
    const getStatusText = (status) => {
        if (!status) return 'Không xác định';
        switch (status) {
            case 'Pending_Deposit_Confirmation':
                return 'Chờ xác nhận cọc';
            case 'Pending_Contract_Signing':
                return 'Chờ ký hợp đồng';
            case 'Pending_Vehicle_Pickup':
                return 'Chờ kiểm tra xe';
            case 'Vehicle_Inspected_Before_Pickup':
                return 'Đã kiểm tra xe';
            case 'Currently_Renting':
                return 'Đang thuê xe';
            case 'Vehicle_Returned':
                return 'Xe đã trả';
            case 'Completed':
                return 'Đã hoàn thành đơn hàng';
            case 'Vehicle_Return_Overdue':
                return 'Quá hạn trả xe';
            case 'Pending_Renter_Confirmation':
                return 'Đợi khách hàng xác nhận';
            case 'Cancelled':
                return 'Đã hủy';
            case 'Pending_Deposit_Payment':
                return 'Đợi thanh toán cọc';
            case 'Vehicle_Inspected_After_Pickup':
                return 'Đợi xác nhận nhận xe';
            case 'Pending_Total_Payment':
                return 'Đợi thanh toán đơn hàng';
            case 'Pending_Total_Payment_Confirmation':
                return 'Đợi xác nhận tổng thanh toán';
            default:
                return 'Không xác định';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending_Deposit_Confirmation':
                return 'status-yellow'; // vàng
            case 'Pending_Contract_Signing':
                return 'status-yellow-dark'; // vàng đậm
            case 'Pending_Vehicle_Pickup':
                return 'status-blue'; // xanh nước
            case 'Vehicle_Inspected_Before_Pickup':
                return 'status-blue-dark'; // xanh nước đậm
            case 'Currently_Renting':
                return 'status-purple'; // tím
            case 'Vehicle_Returned':
                return 'status-purple-dark'; // tím đậm
            case 'Completed':
                return 'status-emerald'; // xanh ngọc
            case 'Vehicle_Return_Overdue':
                return 'status-red'; // đỏ
            case 'Pending_Renter_Confirmation':
                return 'status-yellow';
            case 'Cancelled':
                return 'status-red';
            case 'Pending_Deposit_Payment':
                return 'status-yellow'; // vàng
            case 'Pending_Total_Payment':
                return 'status-yellow';
            case 'Pending_Total_Payment_Confirmation':
                return 'status-yellow';
            default:
                return 'status-blue'; // fallback
        }
    };
    //==================================================

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const [bookings, setBookings] = useState([]); // <- use real bookings from API

    // const tabs = [
    //     { key: 'ALL', label: 'Tất cả' },
    //     { key: 'RENTED', label: 'Đang thuê' },
    //     { key: 'PENDING', label: 'Sắp thuê' },
    //     { key: 'RETURNED', label: 'Đã hoàn tất' },
    //     { key: 'CANCELLED', label: 'Đã hủy' }
    // ];

    // Fetch user's bookings on mount
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError(null);

                const storedUser = localStorage.getItem('ev_user');
                const token = localStorage.getItem('ev_token');

                if (!storedUser) {
                    setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.');
                    setLoading(false);
                    return;
                }

                let parsedUser;
                try {
                    parsedUser = JSON.parse(storedUser);
                } catch (e) {
                    setError('Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.');
                    setLoading(false);
                    return;
                }

                const userId = parsedUser.userId || parsedUser.id || parsedUser.user_id || parsedUser.uid;
                if (!userId) {
                    setError('Không tìm thấy userId. Vui lòng đăng nhập lại.');
                    setLoading(false);
                    return;
                }

                const resp = await fetch(`${API_BASE}/user/booking-history/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token ? `Bearer ${token}` : ''
                    },
                    signal: controller.signal
                });

                if (!isMounted) return;

                if (!resp.ok) {
                    const errBody = await resp.json().catch(() => ({}));
                    setError(errBody.message || `Lỗi khi lấy lịch sử (status ${resp.status})`);
                    setBookings([]);
                    setLoading(false);
                    return;
                }

                const data = await resp.json();

                // Map API response fields to the format MyBookings expects
                // The API returns fields like: bookingId, vehicleModel, brand, licensePlate, bookingStatus, stationName, startTime, expectedReturnTime, deposit, ...
                const mapped = (Array.isArray(data) ? data : []).map(item => ({
                    bookingId: item.bookingId,
                    vehicleBrand: item.brand ?? item.vehicleBrand ?? '',
                    vehicleModel: item.vehicleModel ?? '',
                    seats: item.seats ?? '',
                    pricePerDay: item.price ?? 0.0,
                    licensePlate: item.licensePlate ?? '',
                    status: item.bookingStatus ?? item.bookingStatus ?? 'UNKNOWN',
                    stationName: item.stationName ?? '',
                    stationAddress: item.stationAddress ?? '',
                    // Map times (use startTime / expectedReturnTime fields from API)
                    startAt: item.startTime ?? item.createdAt ?? null,
                    endAt: item.expectedReturnTime ?? item.actualReturnTime ?? null,
                    actualReturnTime: item.actualReturnTime ?? null,
                    // Pricing (API may not provide pricePerHour, extrasFee, totalPrice)
                    extrasFee: item.extrasFee ?? 0,
                    deposit: item.deposit ?? 0,
                    totalPrice: item.deposit / 0.3,
                    // Optional urls if provided - keep for detail page usage
                    contractUrl: item.contractUrl ?? null,
                    invoiceUrl: item.invoiceUrl ?? null,
                    // keep original raw payload so we can forward the full response to detail page
                    odo: item.odo,
                    color: item.color,
                    batteryCapacity: item.batteryCapacity,

                    raw: item
                }));
                mapped.sort((a, b) => Number(a.bookingId) < Number(b.bookingId) ? 1 : -1);
                setBookings(mapped);
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Fetch bookings error', err);
                setError('Không thể tải lịch sử đặt xe. Vui lòng thử lại sau.');
                setBookings([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchBookings();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);


    // Filter bookings by tab/search
    const filteredBookings = bookings.filter(booking => {
        // Filter by status (note: mapping between tab keys and booking.status might need tuning)
        if (activeTab !== 'ALL') {
            // map tab keys to booking.status values - try reasonable mapping
            if (activeTab === 'RENTED' && booking.status !== 'RENTED' && booking.status !== 'RENTAL') return false;
            if (activeTab === 'PENDING' && booking.status !== 'PENDING') return false;
            if (activeTab === 'RETURNED' && (booking.status !== 'Completed' && booking.status !== 'RETURNED' && booking.status !== 'COMPLETED')) return false;
            if (activeTab === 'CANCELLED' && booking.status !== 'CANCELLED') return false;
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                (booking.vehicleModel || '').toLowerCase().includes(q) ||
                (booking.licensePlate || '').toLowerCase().includes(q) ||
                (booking.vehicleBrand || '').toLowerCase().includes(q)
            );
        }
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
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

                {/* Tabs
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
                </motion.div> */}

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
                                const statusClass = (booking.status || 'unknown').toLowerCase().replace('_', '-');
                                return (
                                    <motion.div
                                        key={booking.bookingId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="booking-card"

                                    >
                                        {/* Header */}
                                        <div className="card-header">
                                            <div className="card-vehicle-info">
                                                <h3 style={{ color: "green" }}>Đơn hàng #{booking.bookingId}</h3>
                                                <h3>
                                                    {booking.vehicleBrand} {booking.vehicleModel}
                                                </h3>
                                                {/* <p>{booking.licensePlate}</p> */}
                                            </div>
                                            <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                {getStatusText(booking.status)}
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
                                                <span className="time-value">{fmtDateTime(booking.startAt)}</span>
                                            </div>
                                            <div className="time-row">
                                                <svg className="time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="time-label">Đến:</span>
                                                <span className="time-value">{fmtDateTime(booking.endAt)}</span>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="card-price">
                                            <span className="price-label">Tổng tiền:</span>
                                            <span className="price-amount">
                                                {fmtVND(booking.totalPrice)}
                                            </span>
                                        </div>

                                        {/* View Details Button */}
                                        <button
                                            className="card-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // forward the entire raw booking object to detail page
                                                navigate(`/my-bookings/${booking.bookingId}`, { state: { booking } });
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

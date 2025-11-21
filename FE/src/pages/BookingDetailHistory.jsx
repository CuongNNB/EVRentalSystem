import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MOCK_BOOKINGS } from '../mocks/bookings';
import './BookingDetailHistory.css';
import CheckOutPage from './CheckoutPage'; // <- import CheckoutPage để nhúng vào modal

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
            return 'Đã hoàn tất đơn hàng';
        case 'Completed':
            return 'Đợi thanh toán hóa đơn';
        case 'Vehicle_Return_Overdue':
            return 'Quá hạn trả xe';
        case 'Pending_Renter_Confirmation':
            return 'Đợi khách hàng xác nhận';
        case 'Cancelled':
            return 'Đã hủy';
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
            return 'status-yellow'; // xanh ngọc
        case 'Vehicle_Return_Overdue':
            return 'status-red'; // đỏ
        case 'Pending_Renter_Confirmation':
            return 'status-yellow';
        case 'Total_Fees_Charged':
            return 'status-emerald';
        case 'Cancelled':
            return 'status-red';
        default:
            return 'status-blue'; // fallback
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

    const [inspectionsAfter, setInspectionsAfter] = useState([]);
    const [loadingInspAfter, setLoadingInspAfter] = useState(true);
    const [errorInspAfter, setErrorInspAfter] = useState(null);

    const [additionalFees, setAdditionalFees] = useState([]);
    const [loadingFees, setLoadingFees] = useState(false);
    const [errorFees, setErrorFees] = useState(null);

    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    // collapse / expand states
    const [isOpenCondition, setIsOpenCondition] = useState(true); // Kiểm tra tình trạng xe (mở theo mặc định)
    const [isOpenAfter, setIsOpenAfter] = useState(true);       // Kiểm tra sau khi trả xe (mở theo mặc định)

    const [acceptModalAfterOpen, setAcceptModalAfterOpen] = useState(false);
    const [rejectModalAfterOpen, setRejectModalAfterOpen] = useState(false);

    // NEW: checkout modal state & payload
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [checkoutPayload, setCheckoutPayload] = useState(null);

    // thêm cùng chỗ với các useState hiện tại
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const [cancelError, setCancelError] = useState(null);
    const toggleCondition = () => setIsOpenCondition(prev => !prev);
    const toggleAfter = () => setIsOpenAfter(prev => !prev);

    // danh sách status được phép hiển thị nút "Hủy"
    const cancellableStatuses = [
        'Pending_Deposit_Confirmation',
        'Pending_Contract_Signing',
        'Pending_Vehicle_Pickup',
        'Pending_Renter_Confirmation',
        'Vehicle_Inspected_Before_Pickup',
        null,
        'Không xác định',
    ];

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

    useEffect(() => {
        const bookingIdToUse = booking?.bookingId ? booking.bookingId : (id ? parseInt(id) : null);
        if (!bookingIdToUse) return;

        const fetchInspectionsAfter = async () => {
            try {
                setLoadingInspAfter(true);
                setErrorInspAfter(null);

                const resp = await fetch(`${API_BASE}/inspections/inspection-after`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId: bookingIdToUse }),
                });

                if (!resp.ok) {
                    // try parse error body
                    const err = await resp.json().catch(() => ({}));
                    throw new Error(err.message || `HTTP ${resp.status}`);
                }

                const data = await resp.json();
                // backend trả mảng các object như bạn mô tả — đảm bảo là mảng
                setInspectionsAfter(Array.isArray(data) ? data : []);
            } catch (err) {
                setErrorInspAfter(err.message);
                setInspectionsAfter([]);
            } finally {
                setLoadingInspAfter(false);
            }
        };

        fetchInspectionsAfter();
    }, [booking, id]);


    // 🔹 NEW: Fetch additional fees by bookingId on load, save to localStorage
    useEffect(() => {
        const bookingIdToUse = booking?.bookingId ? booking.bookingId : (id ? parseInt(id) : null);
        if (!bookingIdToUse) return;

        const storageKey = `additionalFees_booking_${bookingIdToUse}`;

        // try to load from localStorage first
        const loadFromLocal = () => {
            try {
                const raw = localStorage.getItem(storageKey);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
                return null;
            } catch (e) {
                return null;
            }
        };

        const cached = loadFromLocal();
        if (cached) {
            setAdditionalFees(cached);
            // still try to refresh from server in background (non-blocking)
        }

        const fetchFees = async () => {
            try {
                setLoadingFees(true);
                setErrorFees(null);

                const resp = await fetch(`${API_BASE}/additional-fees/by-booking`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId: bookingIdToUse }),
                });

                if (!resp.ok) {
                    const errBody = await resp.json().catch(() => ({}));
                    throw new Error(errBody.message || `HTTP ${resp.status}`);
                }

                const data = await resp.json();
                const fees = Array.isArray(data) ? data : [];

                // save to state and localStorage
                setAdditionalFees(fees);
                try {
                    localStorage.setItem(storageKey, JSON.stringify(fees));
                } catch (e) {
                    console.warn("Không thể lưu phụ phí vào localStorage:", e);
                }
            } catch (err) {
                setErrorFees(err.message);
            } finally {
                setLoadingFees(false);
            }
        };

        // Always attempt to fetch fresh data (even if cached exists)
        fetchFees();
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
    // compute days/hours/minutes and price-related data
    const computePriceData = () => {
        // Start luôn là thời điểm đặt / bắt đầu thuê (normalized.startAt)
        const start = normalized.startAt ? new Date(normalized.startAt) : null;

        // End ưu tiên actualReturnTime (ngày trả thực tế), nếu không có thì expectedReturnTime (endAt)
        const endSource = normalized.actualReturnTime ? normalized.actualReturnTime : normalized.endAt;
        const end = endSource ? new Date(endSource) : null;

        // default values
        let durationText = '';     // human readable: "1 ngày 3 giờ" / "3 giờ 15 phút" / "45 phút"
        let daysForBilling = 0;    // số ngày nguyên (cũng giữ để nếu cần tính phí dựa trên ngày)
        if (start && end) {
            let diffMs = end.getTime() - start.getTime();
            if (diffMs < 0) diffMs = 0;

            // Tính tổng phút, giờ, ngày
            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const totalHours = Math.floor(totalMinutes / 60);
            const minutesPart = totalMinutes % 60;

            // 👉 Làm tròn theo quy tắc 30 phút
            let roundedHours = totalHours;
            if (minutesPart >= 30) {
                roundedHours += 1;
            }

            const daysPart = Math.floor(roundedHours / 24);
            const hoursPart = roundedHours % 24;

            // Xây chuỗi hiển thị
            if (daysPart > 0) {
                daysForBilling = daysPart;
                if (hoursPart > 0) {
                    durationText = `${daysPart} ngày ${hoursPart} giờ`;
                } else {
                    durationText = `${daysPart} ngày`;
                }
            } else {
                if (hoursPart > 0) {
                    durationText = `${hoursPart} giờ`;
                } else {
                    durationText = `${minutesPart} phút`;
                }
                daysForBilling = 0;
            }
        }

        const deposit = normalized.deposit ?? 0;

        // Compute extrasFee from fetched additionalFees if available, otherwise fallback to normalized.extrasFee
        const extrasFromResponse = Array.isArray(additionalFees) && additionalFees.length > 0
            ? additionalFees.reduce((sum, f) => {
                const amt = Number(f.amount ?? f.feeAmount ?? f.value ?? f.total ?? 0);
                return sum + (isNaN(amt) ? 0 : amt);
            }, 0)
            : null;

        const extrasFeeComputed = extrasFromResponse !== null ? extrasFromResponse : (normalized.extrasFee ?? 0);

        const estimated = Math.round(deposit / 0.3); // deposit*(1+0.3)
        const total = estimated + extrasFeeComputed;
        return { durationText, daysForBilling, deposit, extrasFee: extrasFeeComputed, estimated, total };
    };
    // hide action buttons if any inspection already CONFIRMED
    const hasConfirmed = inspections.some(i => (i?.status ?? '').toString().toUpperCase() === 'CONFIRMED');
    // Kiểm tra trạng thái inspection AFTER
    const hasConfirmedAfter = inspectionsAfter.some(item => item.status === "CONFIRMED");
    const { durationText, daysForBilling, deposit, extrasFee: extrasFeeDisplayed, estimated, total } = computePriceData();

    // 🔹 ADD: call API to update inspections' status for a bookingId
    // CALL API cập nhật status cho inspections (trước pickup)
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

            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                setInspections(data);
            } else {
                setInspections(prev => prev.map(i => ({ ...i, status })));
            }

            // SUCCESS -> trả về success true
            return { success: true };
        } catch (err) {
            setUpdateError(err.message);
            return { success: false, message: err.message };
        } finally {
            setUpdating(false);
        }
    };
    // CALL API riêng cho "inspection after"
    const callUpdateStatusAfterApi = async (bookingId, status) => {
        setUpdating(true);
        setUpdateError(null);
        try {
            const resp = await fetch(`${API_BASE}/inspections/update-status-after`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, status }),
            });

            if (!resp.ok) {
                const errBody = await resp.json().catch(() => ({}));
                throw new Error(errBody.message || `HTTP ${resp.status}`);
            }

            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                setInspectionsAfter(data);
            } else {
                setInspectionsAfter(prev => prev.map(i => ({ ...i, status })));
            }

            return { success: true };
        } catch (err) {
            setUpdateError(err.message);
            return { success: false, message: err.message };
        } finally {
            setUpdating(false);
        }
    };
    const handleAcceptAllAfter = async () => {
        if (!normalized.bookingId) return;

        const result = await callUpdateStatusAfterApi(normalized.bookingId, 'CONFIRMED');

        if (result.success) {
            // 1) Mở modal SUCCESS
            setAcceptModalAfterOpen(true);

            // 2) Chờ 2 giây rồi điều hướng
            setTimeout(() => {
                navigate('/my-bookings');
            }, 2000);
        } else {
            alert("Cập nhật thất bại: " + (result.message || "Lỗi không xác định"));
        }
    };

    // Close accept modal after
    const handleAcceptAfterClose = () => {
        setAcceptModalAfterOpen(false);
    };

    // Open reject modal after
    const handleOpenRejectModalAfter = () => {
        setRejectModalAfterOpen(true);
    };

    // Cancel reject after
    const handleRejectAfterCancel = () => {
        setRejectModalAfterOpen(false);
    };

    const handleRejectConfirmAfter = async () => {
        setRejectModalAfterOpen(false);
        if (!normalized.bookingId) return;

        const result = await callUpdateStatusAfterApi(normalized.bookingId, "REJECTED");

        if (result.success) {
            navigate('/my-bookings');
        } else {
            alert("Cập nhật thất bại: " + (result.message || "Lỗi không xác định"));
        }
    };


    // Mở modal xác nhận hủy
    const handleOpenCancelModal = () => {
        setCancelError(null);
        setCancelModalOpen(true);
    };

    // Đóng modal hủy
    const handleCloseCancelModal = () => {
        if (canceling) return; // không đóng khi đang gửi
        setCancelModalOpen(false);
        setCancelError(null);
    };

    // Xác nhận hủy: gọi API update-status và navigate nếu thành công
    const handleConfirmCancel = async () => {
        if (!normalized.bookingId) return;
        setCanceling(true);
        setCancelError(null);

        try {
            // backend định nghĩa: PUT /api/user/booking/update-status?bookingId=...&status=...
            const params = new URLSearchParams();
            params.append('bookingId', normalized.bookingId);
            params.append('status', 'Cancelled'); // dùng 'Cancelled' (hoặc 'CANCELLED') tuỳ backend; nếu không ăn, đổi thành 'CANCELLED'

            const resp = await fetch(`${API_BASE}/user/booking/update-status?${params.toString()}`, {
                method: 'PUT'
            });

            if (!resp.ok) {
                const body = await resp.json().catch(() => ({}));
                throw new Error(body.message || `HTTP ${resp.status}`);
            }

            const data = await resp.json().catch(() => ({}));
            // backend trả Map với key "message", nhưng ta chỉ kiểm tra HTTP OK
            // nếu muốn, kiểm tra data.message

            // đóng modal, chuyển trang
            setCancelModalOpen(false);
            navigate('/my-bookings');
        } catch (err) {
            setCancelError(err.message || 'Lỗi khi hủy đơn');
        } finally {
            setCanceling(false);
        }
    };

    const handleAcceptAll = async () => {
        if (!normalized.bookingId) return;

        const result = await callUpdateStatusApi(normalized.bookingId, 'CONFIRMED');

        if (result.success) {
            // 1) Mở modal SUCCESS
            setAcceptModalOpen(true);

            // 2) Chờ 2 giây → navigate
            setTimeout(() => {
                navigate('/my-bookings');
            }, 2000);
        } else {
            alert("Cập nhật thất bại: " + (result.message || "Lỗi không xác định"));
        }
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

    const handleRejectConfirm = async () => {
        setRejectModalOpen(false);
        if (!normalized.bookingId) return;

        const result = await callUpdateStatusApi(normalized.bookingId, "REJECTED");

        if (result.success) {
            // navigate to My Bookings
            navigate('/my-bookings');
        } else {
            alert("Cập nhật thất bại: " + (result.message || "Lỗi không xác định"));
        }
    };


    // CHỈNH: mở modal Checkout và truyền dữ liệu
    // Thay thế hàm handleProceedToCheckout trong BookingDetailHistory.jsx bằng đoạn sau:
    // Thay thế hoàn toàn hàm handleProceedToCheckout cũ bằng đoạn này
    const handleProceedToCheckout = () => {
        // Chuẩn hoá các trường thời gian
        const startIso = normalized.startAt || null;
        // ưu tiên Ngày trả thực tế ở trang BookingDetail (actualReturnTime), nếu không có thì fallback expected endAt
        const actualReturnIso = normalized.actualReturnTime || normalized.endAt || null;

        // Lấy giá thuê/ngày từ dữ liệu đã map ở MyBookings (pricePerDay)
        // (MyBookings đã map API -> booking.pricePerDay). Nếu không có, fallback 0.
        const pricePerDay = Number(
            // normalized có thể chứa pricePerDay hoặc pricePerHour; ưu tiên pricePerDay
            (booking && (booking.pricePerDay ?? booking.price ?? booking.pricePerDay)) ??
            (normalized.pricePerDay ?? normalized.pricePerDay ?? 0)
        ) || 0;

        // Tính thời gian thuê:
        let rentalHours = 0;
        let rentalDays = 0;
        let rentalDurationText = '0 giờ';
        if (startIso && actualReturnIso) {
            const s = new Date(startIso);
            const e = new Date(actualReturnIso);
            if (!isNaN(s) && !isNaN(e) && e.getTime() > s.getTime()) {
                const ms = e.getTime() - s.getTime();
                const totalHoursRaw = ms / (1000 * 60 * 60);
                // làm tròn lên 1 giờ (thông thường billing theo giờ, nếu bạn muốn làm tròn khác thì sửa)
                rentalHours = Math.ceil(totalHoursRaw);
                rentalDays = Math.floor(rentalHours / 24);
                const remHours = rentalHours % 24;
                rentalDurationText = rentalDays > 0 ? `${rentalDays} ngày${remHours > 0 ? ' ' + remHours + ' giờ' : ''}` : `${remHours} giờ`;
            }
        }

        // Tổng giá thuê (theo giờ) = rentalHours * (pricePerDay / 24)
        // (Đây là công thức đúng khi pricePerDay là giá cho 1 ngày.)
        const totalRentalByHour = Math.round(rentalHours * (pricePerDay / 24));

        // Nếu backend đã trả tổng (totalPrice hoặc totalRental), ưu tiên dùng nó
        const backendTotal = Number(normalized.totalPrice ?? normalized.totalRental ?? booking?.totalPrice ?? 0) || 0;
        const totalRentalToSend = backendTotal > 0 ? backendTotal : totalRentalByHour;

        // Build payload theo cấu trúc CheckoutPage mong đợi (location.state.detailBookingSummary hoặc forwardedFromParent)
        const fb = {
            user: {
                name: normalized.raw?.userName || normalized.raw?.renterName || (normalized.raw?.user?.name) || '',
                email: normalized.raw?.user?.email || '',
                phone: normalized.raw?.user?.phone || '',
                address: normalized.raw?.user?.address || ''
            },
            carData: {
                name: normalized.vehicleBrand ? `${normalized.vehicleBrand} ${normalized.vehicleModel || ''}`.trim() : (normalized.vehicleModel || ''),
                licensePlate: normalized.licensePlate || ''
            },
            bookingPayload: {
                pickupLocation: normalized.stationName || normalized.stationAddress || '',
                startTime: startIso || '',
                expectedReturnTime: normalized.endAt || '',
                actualReturnTime: actualReturnIso || null  // <-- forward ngày trả thực tế
            },
            totals: {
                // pricePerDay từ MyBookings (đảm bảo backend pricePerDay được map khi fetch ở MyBookings). :contentReference[oaicite:4]{index=4}
                pricePerDay: Number(pricePerDay) || 0,
                dailyPrice: Number(pricePerDay) || 0, // giữ cả 2 tên để tương thích
                deposit: Number(normalized.deposit ?? booking?.deposit ?? 0) || 0,
                // gửi cả thời lượng tính sẵn và tổng dự tính theo giờ để Checkout dễ hiển thị
                rentalHours,
                rentalDays,
                rentalDurationText,
                totalRentalByHour,
                totalRental: estimated
            },
            bookingId: normalized.bookingId ?? null,
            // extraFees giữ nguyên mapping cũ
            extraFees: Array.isArray(additionalFees) && additionalFees.length > 0
                ? additionalFees.map((f, i) => {
                    const label = (f.feeType && ({
                        Damage_Fee: 'Phí hư hỏng xe',
                        Over_Mileage_Fee: 'Phí vượt odo',
                        Late_Return_Fee: 'Phí trả trễ',
                        Cleaning_Fee: 'Phí vệ sinh',
                        Fuel_Fee: 'Phí nhiên liệu',
                        Other_Fee: 'Phí khác'
                    }[f.feeType])) || f.name || f.feeName || f.title || `Phụ phí ${i + 1}`;
                    const amount = Number(f.amount ?? f.feeAmount ?? f.value ?? f.total ?? 0) || 0;
                    return { id: f.id ?? `fee_${i}`, label, amount };
                })
                : (normalized.extrasFee ? [{ id: 'fallback', label: 'Phụ phí (tổng)', amount: Number(normalized.extrasFee) || 0 }] : [])
        };

        // Mở modal và truyền payload (hiện tại BookingDetailHistory đang embed CheckoutPage trong modal).
        setCheckoutPayload(fb);
        setCheckoutModalOpen(true);
    };


    const closeCheckoutModal = () => {
        setCheckoutModalOpen(false);
        setCheckoutPayload(null);
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
                        <h1 className="detail-title">Chi tiết đơn hàng #{normalized.bookingId}</h1>
                        <span className={`status-badge ${getStatusClass(booking.status)}`}>
                            {getStatusText(booking.status)}
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
                                <div className="info-row"><span className="info-label">Odo:</span><span className="info-value">{normalized.odo}</span></div>
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
                                <span className="price-value">{durationText || 'Đang cập nhật'}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">Tiền dự tính phải trả:</span>
                                <span className="price-value">{fmtVND(estimated)}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">Số tiền đã đặt cọc:</span>
                                <span className="price-value">{fmtVND(deposit)}</span>
                            </div>

                            {/* Phụ phí: hiển thị danh sách phụ phí có tên tiếng Việt */}
                            <div className="price-row">
                                <span className="price-label">Phụ phí:</span>
                                {/* Phần hiển thị phụ phí */}
                                <div className="fees-container">
                                    {/* Tiêu đề nhỏ (nếu muốn giống ảnh) */}
                                    <div className="fees-header">Các chi phí phát sinh</div>

                                    {/* Tổng phụ phí - nổi bật ở trên cùng */}
                                    <div className="fee-line fee-total">
                                        <span className="fee-label" style={{ fontWeight: 'bold' }}>Tổng phụ phí</span>
                                        <span className="fee-amount">{fmtVND(extrasFeeDisplayed)}</span>
                                    </div>

                                    {/* Loading & Error */}
                                    {loadingFees && <div className="fee-line"><span className="fee-label">Đang tải...</span></div>}
                                    {errorFees && <div className="fee-line text-error"><span className="fee-label">Lỗi tải phụ phí: {errorFees}</span></div>}

                                    {/* Danh sách chi tiết phụ phí */}
                                    {!loadingFees && Array.isArray(additionalFees) && additionalFees.length > 0 ? (
                                        <div className="fee-list">
                                            {additionalFees.map((fee, idx) => {
                                                const feeType = (fee.feeType ?? fee.name ?? fee.feeName ?? '').trim();
                                                const feeNameMap = {
                                                    Damage_Fee: 'Phí hư hỏng xe',
                                                    Over_Mileage_Fee: 'Phí vượt quá odo quy định',
                                                    Late_Return_Fee: 'Phí trả trễ xe',
                                                    Cleaning_Fee: 'Phí vệ sinh xe',
                                                    Fuel_Fee: 'Phí pin',
                                                    Other_Fee: 'Phí khác',
                                                };
                                                const label = feeNameMap[feeType] || feeType || fee.title || `Phụ phí ${idx + 1}`;
                                                const amount = Number(fee.amount ?? fee.feeAmount ?? fee.value ?? fee.total ?? 0) || 0;

                                                return (
                                                    <div key={idx} className="fee-item">
                                                        <span className="fee-item-label">- {label}</span>
                                                        <span className="fee-item-amount">{fmtVND(amount)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        !loadingFees && (
                                            <div className="fee-line">
                                                <span className="fee-label">Không có mục phụ phí chi tiết</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="price-total">
                                <span className="price-total-label">Tổng thanh toán:</span>
                                <span className="price-total-value">{fmtVND(total)}</span>
                            </div>

                            {normalized.status === 'Completed' && (
                                <div className="price-actions">
                                    <button
                                        className="btn-pay"
                                        onClick={handleProceedToCheckout}
                                    >
                                        Thanh toán
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Inspection */}
                    <motion.div className="detail-card inspection-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <span className="section-title">Kiểm tra tình trạng xe</span>

                            {/* Toggle button (giữ ở ngoài nội dung, không làm thay đổi structure của .inspection-list) */}
                            <button
                                type="button"
                                className="section-header-toggle"
                                onClick={toggleCondition}
                                aria-expanded={isOpenCondition}
                                aria-controls="inspection-condition"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <span className={`caret ${isOpenCondition ? '' : 'rotate'}`} aria-hidden>▾</span>
                            </button>
                        </h2>

                        {loadingInsp && <p>🔄 Đang tải thông tin kiểm tra...</p>}
                        {errorInsp && <p className="text-error">Đang cập nhật...</p>}

                        {!loadingInsp && !errorInsp && inspections.length === 0 && (
                            <p>Không có dữ liệu kiểm tra nào cho đơn này.</p>
                        )}

                        {/* WRAPPER COLLAPSIBLE — KHÔNG THAY ĐỔI NỘI DUNG .inspection-list */}
                        <div id="inspection-condition" className={`collapsible ${isOpenCondition ? '' : 'collapsed'}`}>
                            <div className="inspection-list">
                                {inspections.map((insp) => (
                                    <div key={insp.inspectionId} className="inspection-item">
                                        {/* <-- GIỮ NGUYÊN TOÀN BỘ NỘI DUNG BÊN TRONG --> */}
                                        <div className="inspection-info">
                                            <div><strong>Phần:</strong> {insp.partName}</div>
                                            <div>
                                                <strong>Trạng thái:</strong>{' '}
                                                {insp.status === 'CONFIRMED'
                                                    ? 'Đã đồng ý'
                                                    : insp.status === 'PENDING'
                                                        ? 'Đang chờ xác thực'
                                                        : insp.status === 'REJECTED'
                                                            ? 'Đã từ chối'
                                                            : insp.status ?? 'Không xác định'}
                                            </div>
                                            <div><strong>Nhân viên:</strong> {insp.staffName}</div>
                                            <div><strong>Thời gian:</strong> {fmtDateTime(insp.inspectedAt)}</div>
                                            <div><strong>Mô tả:</strong> {insp.description || '---'}</div>
                                        </div>
                                        {insp.pictureUrl && insp.pictureUrl.trim() !== '' ? (
                                            <div className="inspection-image-box">
                                                <img
                                                    src={insp.pictureUrl}
                                                    alt={insp.partName || 'Ảnh kiểm tra'}
                                                    className="inspection-image"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const link = e.target.parentNode.querySelector('.document-view-link');
                                                        if (link) link.style.display = 'none';
                                                    }}
                                                />
                                                <a href={insp.pictureUrl} target="_blank" rel="noreferrer" className="document-view-link">Xem ảnh lớn</a>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}

                                {inspections.length > 0 && !hasConfirmed && (
                                    <div className="inspection-actions">
                                        <button className="btn-accept" onClick={handleAcceptAll} disabled={updating} title={updating ? "Đang xử lý..." : "Chấp nhận tất cả"}>
                                            {updating ? 'Đang xử lý...' : 'Chấp nhận'}
                                        </button>

                                        <button className="btn-reject" onClick={handleOpenRejectModal} disabled={updating} style={{ marginLeft: 12 }} title={updating ? "Đang xử lý..." : "Từ chối"}>
                                            Từ chối
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>


                    {/* ===== KIỂM TRA SAU KHI TRẢ XE ===== */}
                    <motion.div
                        className="detail-card inspection-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2
                            className="section-header"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12
                            }}
                        >
                            <span className="section-title">Kiểm tra sau khi trả xe</span>

                            {/* Toggle button (không thay đổi nội dung bên trong) */}
                            <button
                                type="button"
                                className="section-header-toggle"
                                onClick={toggleAfter}
                                aria-expanded={isOpenAfter}
                                aria-controls="inspection-after"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <span className={`caret ${isOpenAfter ? '' : 'rotate'}`} aria-hidden>
                                    ▾
                                </span>
                            </button>
                        </h2>

                        {loadingInspAfter && <p>🔄 Đang tải thông tin kiểm tra sau...</p>}
                        {errorInspAfter && <p className="text-error">Đang cập nhật...</p>}

                        {!loadingInspAfter && !errorInspAfter && inspectionsAfter.length === 0 && (
                            <p>Không có dữ liệu kiểm tra sau cho đơn này.</p>
                        )}

                        {/* WRAPPER COLLAPSIBLE — giữ nguyên toàn bộ nội dung .inspection-list */}
                        <div
                            id="inspection-after"
                            className={`collapsible ${isOpenAfter ? '' : 'collapsed'}`}
                        >
                            <div className="inspection-list">
                                {inspectionsAfter.map((ia) => (
                                    <div key={ia.inspectionId} className="inspection-item">
                                        {/* giữ nguyên cấu trúc hiển thị thông tin */}
                                        <div className="inspection-info">
                                            <div>
                                                <strong>Phần:</strong> {ia.partName}
                                            </div>
                                            <div>
                                                <strong>Trạng thái:</strong>{' '}
                                                {ia.status === 'CONFIRMED'
                                                    ? 'Đã đồng ý'
                                                    : ia.status === 'PENDING'
                                                        ? 'Đang chờ xác thực'
                                                        : ia.status === 'REJECTED'
                                                            ? 'Đã từ chối'
                                                            : ia.status ?? 'Không xác định'}
                                            </div>
                                            <div>
                                                <strong>Nhân viên:</strong> {ia.staffName}
                                            </div>
                                            <div>
                                                <strong>Thời gian:</strong> {fmtDateTime(ia.inspectedAt)}
                                            </div>
                                            <div>
                                                <strong>Mô tả:</strong> {ia.description || '---'}
                                            </div>
                                        </div>

                                        {/* giữ nguyên phần hiển thị ảnh / link (onError vẫn hoạt động) */}
                                        {ia.pictureUrl && ia.pictureUrl.trim() !== '' ? (
                                            <div className="inspection-image-box">
                                                <img
                                                    src={ia.pictureUrl}
                                                    alt={ia.partName || 'Ảnh kiểm tra sau'}
                                                    className="inspection-image"
                                                    onError={(e) => {
                                                        // giữ logic onError gốc để ẩn ảnh + link nếu bị lỗi
                                                        e.target.style.display = 'none';
                                                        const link = e.target.parentNode.querySelector('.document-view-link');
                                                        if (link) link.style.display = 'none';
                                                    }}
                                                />
                                                <a
                                                    href={ia.pictureUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="document-view-link"
                                                >
                                                    Xem ảnh lớn
                                                </a>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}

                                {/* Khi có inspectionsAfter và chưa confirm, hiển thị actions (giữ nguyên) */}
                                {inspectionsAfter.length > 0 && !hasConfirmedAfter && (
                                    <div className="inspection-actions">
                                        <button
                                            className="btn-accept"
                                            onClick={handleAcceptAllAfter}
                                            disabled={updating}
                                            title={updating ? "Đang xử lý..." : "Chấp nhận tất cả"}
                                        >
                                            {updating ? 'Đang xử lý...' : 'Chấp nhận'}
                                        </button>

                                        <button
                                            className="btn-reject"
                                            onClick={handleOpenRejectModalAfter}
                                            disabled={updating}
                                            style={{ marginLeft: 12 }}
                                            title={updating ? "Đang xử lý..." : "Từ chối"}
                                        >
                                            Từ chối
                                        </button>


                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Nút Hủy đơn hàng - chỉ hiện với các trạng thái cho phép */}
                    {cancellableStatuses.includes(normalized.status ?? null) && (
                        <button
                            className="btn-cancel"
                            onClick={handleOpenCancelModal}
                            disabled={canceling || updating}
                            style={{ marginLeft: 12, backgroundColor: '#e74c3c', color: '#fff' }}
                            title="Hủy đơn hàng"
                        >
                            {canceling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                        </button>
                    )}
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

            {/* 🔹 ACCEPT MODAL FOR INSPECTION AFTER */}
            {acceptModalAfterOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-card">
                        <h3>Đã xác nhận kiểm tra sau khi trả xe</h3>
                        <p>Kết quả kiểm tra sau cho đơn #{normalized.bookingId} đã được cập nhật. Cảm ơn bạn.</p>

                        {updating && <p style={{ marginTop: 8 }}>Đang gửi yêu cầu...</p>}
                        {updateError && <p className="text-error" style={{ marginTop: 8 }}>{updateError}</p>}

                        <div className="modal-actions" style={{ marginTop: 12 }}>
                            <button
                                className="modal-btn modal-confirm"
                                onClick={handleAcceptAfterClose}
                                disabled={updating}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 REJECT CONFIRMATION MODAL FOR INSPECTION AFTER */}
            {rejectModalAfterOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-card">
                        <h3>Bạn có chắc chắn muốn từ chối?</h3>
                        <p>
                            Nếu bạn từ chối chúng tôi sẽ tiến hành kiểm tra lại xe
                        </p>

                        {updating && <p style={{ marginTop: 8 }}>Đang gửi yêu cầu...</p>}
                        {updateError && <p className="text-error" style={{ marginTop: 8 }}>{updateError}</p>}

                        <div className="modal-actions" style={{ marginTop: 12 }}>
                            <button
                                className="modal-btn modal-cancel"
                                onClick={handleRejectAfterCancel}
                                disabled={updating}
                            >
                                Huỷ
                            </button>
                            <button
                                className="modal-btn modal-confirm"
                                onClick={handleRejectConfirmAfter}
                                disabled={updating}
                            >
                                {updating ? "Đang xử lý..." : "Từ chối"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 CHECKOUT MODAL (EMBEDDED CheckoutPage) */}
            {checkoutModalOpen && (
                <div className="modal-overlay large" role="dialog" aria-modal="true" onClick={closeCheckoutModal}>
                    <div className="modal-card large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1100, width: '95%', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h3 style={{ margin: 0 }}>Thanh toán đơn hàng #{normalized.bookingId}</h3>
                            <button className="modal-close" onClick={closeCheckoutModal} aria-label="Đóng">Đóng ✕</button>
                        </div>

                        {/* Embed CheckoutPage and pass forwardedFromParent + embedded flag to hide Header/Footer */}
                        <div style={{ width: '100%' }}>
                            <CheckOutPage forwardedFromParent={checkoutPayload} embedded={true} />
                        </div>
                    </div>
                </div>
            )}
            {/* 🔹 CANCEL BOOKING CONFIRMATION MODAL */}
            {cancelModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-card">
                        <h3>Xác nhận hủy đơn</h3>
                        <p>Bạn có chắc muốn hủy đơn #{normalized.bookingId}? Hành động này sẽ huỷ đặt xe và cập nhật trạng thái xe.</p>

                        {canceling && <p style={{ marginTop: 8 }}>Đang gửi yêu cầu hủy...</p>}
                        {cancelError && <p className="text-error" style={{ marginTop: 8 }}>{cancelError}</p>}

                        <div className="modal-actions" style={{ marginTop: 12 }}>
                            <button
                                className="modal-btn modal-cancel"
                                onClick={handleCloseCancelModal}
                                disabled={canceling}
                            >
                                Huỷ
                            </button>
                            <button
                                className="modal-btn modal-confirm"
                                onClick={handleConfirmCancel}
                                disabled={canceling}
                            >
                                {canceling ? 'Đang hủy...' : 'Xác nhận hủy'}
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

// src/pages/admin/BookingManagement.jsx
// Dựa trên: /mnt/data/VehicleManagement.jsx
import React, { useEffect, useState } from "react";
import "./AdminDashboardNew.css";
import "./VehicleManagement.css";
import ErrorBoundary from "../../components/admin/ErrorBoundary";

const BookingManagement = () => {
    const API_BASE = "http://localhost:8084/EVRentalSystem";

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatusMap, setSelectedStatusMap] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [currentRowForUpdate, setCurrentRowForUpdate] = useState(null);

    // trạng thái dropdown (theo yêu cầu)
    const statusOptions = [
        "Pending_Deposit_Payment",
        "Pending_Deposit_Confirmation",
        "Pending_Contract_Signing",
        "Pending_Vehicle_Pickup",
        "Pending_renter_confirmation",
        "Vehicle_Inspected_Before_Pickup",
        "Vehicle_Pickup_Overdue",
        "Currently_Renting",
        "Vehicle_Returned",
        "Total_Fees_Charged",
        "Completed",
        "Vehicle_Return_Overdue",
        "Pending_Renter_Confirmation",
        "Cancelled",
    ];

    // mapping trạng thái -> label tiếng Việt (dùng của bạn)
    const getStatusText = (status) => {
        if (!status) return "Không xác định";
        switch (status) {
            case "Pending_Deposit_Confirmation":
                return "Chờ thanh toán cọc";
            case "Pending_Contract_Signing":
                return "Chờ ký hợp đồng";
            case "Pending_Vehicle_Pickup":
                return "Chờ nhận xe";
            case "Vehicle_Inspected_Before_Pickup":
                return "Xe đang kiểm tra trước khi giao";
            case "Vehicle_Pickup_Overdue":
                return "Quá hạn nhận xe";
            case "Currently_Renting":
                return "Đang thuê xe";
            case "Vehicle_Returned":
                return "Xe đã trả";
            case "Total_Fees_Charged":
                return "Đã hoàn tất đơn hàng";
            case "Completed":
                return "Đợi thanh toán hóa đơn";
            case "Vehicle_Return_Overdue":
                return "Quá hạn trả xe";
            case "Pending_Renter_Confirmation":
                return "Đợi khách hàng xác nhận";
            case "Cancelled":
                return "Đã hủy";
            case "Pending_Deposit_Payment":
                return "Đợi thanh toán cọc";
            default:
                return "Không xác định";
        }
    };

    // format ngày giờ dạng dd/MM/yyyy HH:mm
    const formatDateTime = (value) => {
        if (!value && value !== 0) return "-";
        // try to handle unix timestamp / number / ISO string
        const d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // format tiền
    const formatMoney = (value) => {
        if (value === null || value === undefined || value === "") return "-";
        const num = Number(value);
        if (Number.isNaN(num)) return String(value);
        return num.toLocaleString("vi-VN");
    };

    // helper: tìm key thực tế trong object từ danh sách candidates
    const findKey = (obj = {}, candidates = []) => {
        for (const c of candidates) {
            if (Object.prototype.hasOwnProperty.call(obj, c)) return c;
            // case-insensitive
            const lowerKeys = Object.keys(obj).find((k) => k.toLowerCase() === c.toLowerCase());
            if (lowerKeys) return lowerKeys;
        }
        return null;
    };

    // fetch bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/user-management/get-bookings`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // normalize array
            let arr = [];
            if (Array.isArray(data)) arr = data;
            else if (data && Array.isArray(data.data)) arr = data.data;
            else {
                const key = Object.keys(data || {}).find((k) => Array.isArray(data[k]));
                arr = key ? data[key] : [];
            }

            setRows(arr);
        } catch (err) {
            console.error("Fetch bookings failed:", err);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // tìm tên key cụ thể (ứng với yêu cầu sắp xếp cột)
    // candidates for each desired column (bảo đảm linh hoạt nếu api đổi tên)
    const renterKey = findKey(rows[0] || {}, ["renterName", "renter", "customerName", "userName", "name", "fullName"]);
    const brandKey = findKey(rows[0] || {}, ["vehicleBrand", "brand", "make"]);
    const modelKey = findKey(rows[0] || {}, ["vehicleModel", "model", "vehicle_model", "modelName"]);
    const startKey = findKey(rows[0] || {}, ["startTime", "start", "startAt", "start_time", "startDate", "startAtTime"]);
    const expectedReturnKey = findKey(rows[0] || {}, ["expectedReturnTime", "expectedReturn", "expectedReturnAt", "expected_return_time"]);
    const actualReturnKey = findKey(rows[0] || {}, ["actualReturnTime", "actualReturn", "actualReturnAt", "actual_return_time"]);
    const depositKey = findKey(rows[0] || {}, ["deposit", "depositAmount", "deposit_amount"]);
    const paymentTotalKey = findKey(rows[0] || {}, ["paymentTotal", "total", "payment_total", "totalPayment", "paymentTotalAmount"]);
    const statusKey = findKey(rows[0] || {}, ["status", "bookingStatus", "state"]);

    // build ordered columns, only include those that exist and ignore id-like keys
    const orderedColumns = [
        { key: renterKey, label: "Khách thuê" },
        { key: brandKey, label: "Thương hiệu" },
        { key: modelKey, label: "Model" },
        { key: startKey, label: "Thời gian nhận xe" },
        { key: expectedReturnKey, label: "Thời gian trả dự kiến" },
        { key: actualReturnKey, label: "Thời gian trả thực tế" },
        { key: depositKey, label: "Tiền đặt cọc" },
        { key: paymentTotalKey, label: "Tổng thanh toán" },
        { key: statusKey, label: "Trạng thái" },
    ].filter((c) => c.key !== null); // loại các cột không tìm thấy

    // search filter
    const filtered = rows.filter((r) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        // search in the ordered columns + fallback all string values
        for (const c of orderedColumns) {
            const v = r[c.key];
            if (v !== null && v !== undefined && String(v).toLowerCase().includes(q)) return true;
        }
        // fallback: any field
        return Object.values(r).some((v) => (v ?? "").toString().toLowerCase().includes(q));
    });

    // handlers for status selection
    const onStatusChange = (row, newStatus) => {
        const id = row.bookingId ?? row.id ?? JSON.stringify(row);
        setSelectedStatusMap((s) => ({ ...s, [id]: newStatus }));
    };

    const openConfirm = (row) => {
        setCurrentRowForUpdate(row);
        setShowConfirm(true);
    };

    const closeConfirm = () => {
        setShowConfirm(false);
        setCurrentRowForUpdate(null);
    };

    const doUpdateStatus = async () => {
        if (!currentRowForUpdate) return;
        const id = currentRowForUpdate.bookingId ?? currentRowForUpdate.id;
        const chosen = selectedStatusMap[id] ?? currentRowForUpdate[statusKey];

        try {
            const res = await fetch(
                `${API_BASE}/api/user/booking/update-status?bookingId=${id}&status=${encodeURIComponent(chosen)}`,
                {
                    method: "PUT",
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            // optionally read message
            await res.json().catch(() => { });
            // refresh list
            await fetchBookings();
        } catch (err) {
            console.error("Update status failed:", err);
            // TODO: show notification
        } finally {
            closeConfirm();
        }
    };

    // render cell value with formatting
    const renderCell = (key, value) => {
        if (value === null || value === undefined) return "-";
        const lowerKey = (key || "").toLowerCase();
        // date/time heuristics
        if (lowerKey.includes("time") || lowerKey.includes("date") || lowerKey.includes("at")) {
            return formatDateTime(value);
        }
        // money heuristics
        if (typeof value === "number") {
            if (lowerKey.includes("total") || lowerKey.includes("payment") || lowerKey.includes("price") || lowerKey.includes("deposit")) {
                return formatMoney(value) + " đ";
            }
            return String(value);
        }
        // numeric string for money
        if (!isNaN(Number(value))) {
            if (lowerKey.includes("total") || lowerKey.includes("payment") || lowerKey.includes("deposit") || lowerKey.includes("price")) {
                return formatMoney(Number(value)) + " đ";
            }
        }
        // default
        return String(value);
    };

    return (
        <ErrorBoundary>
            {/* Breadcrumb */}
            <div className="admin-breadcrumb">
                <i className="fas fa-home"></i>
                <span>Quản trị</span>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý đơn hàng</span>
            </div>

            {/* Header */}
            <div className="admin-page-header">
                <div className="admin-page-header-left">
                    <div className="admin-page-icon" style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
                        <i className="fas fa-clipboard-list"></i>
                    </div>
                    <div className="admin-page-title-group">
                        <h1 className="admin-page-title">Quản lý đơn hàng</h1>
                        <p className="admin-page-subtitle">Danh sách đơn hàng - admin</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="vehicle-toolbar">
                <div className="vehicle-search">
                    <i className="fas fa-search"></i>
                    <input
                        placeholder="Tìm kiếm (tất cả trường)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ marginLeft: "auto" }}>
                    <button className="admin-btn admin-btn-secondary" onClick={fetchBookings}>
                        <i className="fas fa-sync-alt"></i>
                        <span>Làm mới</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="vehicles-table-container">
                {loading ? (
                    <div className="empty-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Đang tải danh sách...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-list"></i>
                        <p>Không tìm thấy đơn hàng</p>
                    </div>
                ) : (
                    <table className="vehicles-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                {orderedColumns.map((c) => (
                                    <th key={c.key}>{c.label}</th>
                                ))}
                                <th>Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((r, i) => {
                                const id = r.bookingId ?? r.id ?? JSON.stringify(r);
                                return (
                                    <tr key={id}>
                                        <td>{i + 1}</td>

                                        {orderedColumns.map((c) => {
                                            // status cell: show pretty label + dropdown
                                            if (c.key === statusKey) {
                                                const currentRaw = selectedStatusMap[id] ?? r[c.key];
                                                return (
                                                    <td key={c.key}>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                            <select
                                                                className="booking-status-dropdown"
                                                                value={currentRaw ?? ""}
                                                                onChange={(e) => onStatusChange(r, e.target.value)}
                                                            >
                                                                {[...new Set([r[c.key], ...statusOptions])].map((st) => (
                                                                    <option key={st} value={st}>
                                                                        {getStatusText(st) !== "Không xác định" ? getStatusText(st) : st}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            // default cell
                                            return <td key={c.key}>{renderCell(c.key, r[c.key])}</td>;
                                        })}

                                        <td>
                                            <button className="admin-btn admin-btn-primary" onClick={() => openConfirm(r)}>
                                                Cập nhật
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Confirm overlay */}
            {showConfirm && currentRowForUpdate && (
                <div className="overlay-confirm">
                    <div className="confirm-box">
                        <h3>Xác nhận cập nhật trạng thái?</h3>
                        <p>
                            Bạn có chắc muốn cập nhật đơn hàng #
                            {currentRowForUpdate.bookingId ?? currentRowForUpdate.id}?
                        </p>
                        <div style={{ marginTop: 12 }}>
                            <button className="admin-btn admin-btn-danger" onClick={closeConfirm} style={{ marginRight: 12 }}>
                                Hủy
                            </button>
                            <button className="admin-btn admin-btn-primary" onClick={doUpdateStatus}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
/* ========== DROPDOWN STATUS ========== */
.booking-status-dropdown {
    width: 100%;
    padding: 6px 8px;
    font-size: 14px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: #ffffff;
    color: #111827;
    outline: none;
    cursor: pointer;
    transition: 0.2s ease;
}

.booking-status-dropdown:hover {
    border-color: #3b82f6;
}

.booking-status-dropdown:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.25);
}

/* Option styling (trên Chrome chỉ hỗ trợ hạn chế) */
.booking-status-dropdown option {
    padding: 8px;
}

/* ========== OVERLAY CONFIRM ========== */
.overlay-confirm {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    animation: fadeInOverlay 0.2s ease-out;
}

@keyframes fadeInOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
}

.confirm-box {
    width: 360px;
    background: #ffffff;
    padding: 22px 26px;
    border-radius: 14px;
    box-shadow: 0 10px 28px rgba(0,0,0,0.22);
    animation: popIn 0.25s ease-out;
}

@keyframes popIn {
    0% { transform: scale(0.85); opacity: 0; }
    100% { transform: scale(1); opacity: 1;}
}

.confirm-box h3 {
    margin: 0;
    font-size: 18px;
    color: #111827;
    font-weight: 600;
    text-align: center;
}

.confirm-box p {
    font-size: 15px;
    color: #4b5563;
    margin: 14px 0;
    text-align: center;
}

/* ========== BUTTONS INSIDE OVERLAY ========== */
.confirm-box .admin-btn-primary {
    background: #3b82f6 !important;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
}

.confirm-box .admin-btn-danger {
    background: #ef4444 !important;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
}

.confirm-box .admin-btn-primary:hover {
    background: #2563eb !important;
}

.confirm-box .admin-btn-danger:hover {
    background: #dc2626 !important;
}
`}</style>

        </ErrorBoundary>
    );
};

export default BookingManagement;
